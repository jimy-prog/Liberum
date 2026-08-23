with open("templates/performance.html", "r") as f:
    text = f.read()

# Instead of colors (red/yellow/green), use a 0-10 score input
# This is a bit complex. Let's just make sure we update the chart data first.
import re

# The user complained the dummy data in group comparison is the same for all students.
# Let's seed some random dummy data into WeeklyPerformance for the current month!
