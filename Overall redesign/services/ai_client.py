import os
import google.generativeai as genai
from openai import OpenAI
from config import GEMINI_API_KEY, OPENAI_API_KEY
import json

class UniversalAIClient:
    def __init__(self, primary_provider="openai"):
        self.primary_provider = primary_provider
        self.gemini_model_name = "gemini-2.5-flash"
        self.openai_model_name = "gpt-4o-mini"

        # Initialize Gemini
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.gemini_model = genai.GenerativeModel(self.gemini_model_name)
        else:
            self.gemini_model = None

        # Initialize OpenAI
        if OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
        else:
            self.openai_client = None

    def generate_chat_response(self, system_prompt, history, user_message):
        """
        history is a list of dicts: [{"role": "user", "parts": "..."}, {"role": "model", "parts": "..."}]
        (Gemini style history, which we translate internally).
        """
        if self.primary_provider == "openai":
            try:
                return self._call_openai_chat(system_prompt, history, user_message)
            except Exception as e:
                error_str = str(e).lower()
                if "rate_limit" in error_str or "quota" in error_str or "429" in error_str:
                    if self.gemini_model:
                        return self._call_gemini_chat(system_prompt, history, user_message)
                raise e
        else:
            try:
                return self._call_gemini_chat(system_prompt, history, user_message)
            except Exception as e:
                error_str = str(e).lower()
                if "resourceexhausted" in error_str or "quota" in error_str or "429" in error_str:
                    if self.openai_client:
                        return self._call_openai_chat(system_prompt, history, user_message)
                raise e

    def generate_structured_response(self, prompt, response_schema=None, images=None):
        """
        Generate generic response, typically json.
        images is a list of PIL.Image objects.
        """
        if self.primary_provider == "openai":
            try:
                return self._call_openai_generate(prompt, response_schema, images)
            except Exception as e:
                error_str = str(e).lower()
                if "rate_limit" in error_str or "quota" in error_str or "429" in error_str:
                    if self.gemini_model:
                        return self._call_gemini_generate(prompt, response_schema, images)
                raise e
        else:
            try:
                return self._call_gemini_generate(prompt, response_schema, images)
            except Exception as e:
                error_str = str(e).lower()
                if "resourceexhausted" in error_str or "quota" in error_str or "429" in error_str:
                    if self.openai_client:
                        return self._call_openai_generate(prompt, response_schema, images)
                raise e

    def _call_gemini_chat(self, system_prompt, history, user_message):
        if not self.gemini_model:
            raise Exception("Gemini API key is not configured.")
        
        chat = self.gemini_model.start_chat(history=history)
        full_message = f"SYSTEM INSTRUCTION (DO NOT SHOW THIS TO THE USER):\n{system_prompt}\n\nUSER MESSAGE:\n{user_message}"
        response = chat.send_message(full_message)
        return response.text

    def _call_openai_chat(self, system_prompt, history, user_message):
        if not self.openai_client:
            raise Exception("OpenAI API key is not configured.")
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            role = "user" if msg["role"] == "user" else "assistant"
            content = msg["parts"][0] if isinstance(msg["parts"], list) else msg["parts"]
            messages.append({"role": role, "content": content})
            
        messages.append({"role": "user", "content": user_message})
        
        response = self.openai_client.chat.completions.create(
            model=self.openai_model_name,
            messages=messages
        )
        return response.choices[0].message.content

    def _call_gemini_generate(self, prompt, response_schema=None, images=None):
        if not self.gemini_model:
            raise Exception("Gemini API key is not configured.")
        
        contents = [prompt]
        if images:
            contents.extend(images)
            
        if response_schema:
            response = self.gemini_model.generate_content(
                contents,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema
                )
            )
        else:
            response = self.gemini_model.generate_content(contents)
        return response.text

    def _call_openai_generate(self, prompt, response_schema=None, images=None):
        if not self.openai_client:
            raise Exception("OpenAI API key is not configured.")
            
        content = [{"type": "text", "text": prompt}]
        if images:
            import base64
            import io
            for img in images:
                buf = io.BytesIO()
                img.save(buf, format="JPEG")
                img_str = base64.b64encode(buf.getvalue()).decode("utf-8")
                content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_str}"}})
                
        messages = [{"role": "user", "content": content}]
        if response_schema:
            messages.insert(0, {"role": "system", "content": "You are a helpful assistant designed to output JSON."})
            response = self.openai_client.chat.completions.create(
                model=self.openai_model_name,
                messages=messages,
                response_format={ "type": "json_object" }
            )
        else:
            response = self.openai_client.chat.completions.create(
                model=self.openai_model_name,
                messages=messages
            )
        return response.choices[0].message.content
