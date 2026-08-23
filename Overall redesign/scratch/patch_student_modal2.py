with open("templates/student_detail_modal.html", "r") as f:
    text = f.read()

spider_chart = '''
        <!-- Performance Radar -->
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:20px">
          <div style="font-size:14px;font-weight:600;margin-bottom:16px">Performance Metrics</div>
          {% if p_avg and (p_avg.v or p_avg.g or p_avg.f or p_avg.h) %}
          <div style="position:relative;height:220px;width:100%">
            <canvas id="radarChart"></canvas>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
          <script>
          setTimeout(() => {
            const ctx = document.getElementById('radarChart');
            if(!ctx) return;
            new Chart(ctx, {
              type: 'radar',
              data: {
                labels: ['Vocabulary', 'Grammar', 'Fluency', 'Homework'],
                datasets: [{
                  label: 'Student Score (avg)',
                  data: [{{ p_avg.v }}, {{ p_avg.g }}, {{ p_avg.f }}, {{ p_avg.h }}],
                  backgroundColor: 'rgba(123, 97, 255, 0.2)',
                  borderColor: 'rgba(123, 97, 255, 1)',
                  pointBackgroundColor: 'rgba(123, 97, 255, 1)',
                  pointBorderColor: '#fff',
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(120,120,128,0.2)' },
                    grid: { color: 'rgba(120,120,128,0.2)' },
                    pointLabels: { color: 'var(--txt2)', font: { size: 12 } },
                    ticks: { min: 0, max: 10, stepSize: 2, display: false }
                  }
                },
                plugins: { legend: { display: false } }
              }
            });
          }, 300);
          </script>
          {% else %}
          <div style="font-size:13px;color:var(--txt3);text-align:center;padding:30px 0">No performance data yet.</div>
          {% endif %}
        </div>
'''

if 'id="radarChart"' not in text:
    text = text.replace('<!-- Left Column -->\n      <div style="flex:1;display:flex;flex-direction:column;gap:16px">', '<!-- Left Column -->\n      <div style="flex:1;display:flex;flex-direction:column;gap:16px">\n' + spider_chart)
    with open("templates/student_detail_modal.html", "w") as f:
        f.write(text)
