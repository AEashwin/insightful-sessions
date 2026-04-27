Plan to update the Model Outputs / Model Results dashboard:

1. Add expanded views for key charts
   - Add an expand action to the chart panels for:
     - Model fit
     - Decomposition
     - Contribution pie chart
     - Effectiveness
     - ROI
     - S+C+ROI
     - Response curves
   - Expanded views will open inside the existing dashboard area or modal-style panel, keeping the compact chart visible in the dashboard.

2. Model fit expanded view
   - Show the model fit line chart larger.
   - Add a data table below it with period/week, actual, predicted, variance, and variance %.

3. Decomposition expanded view
   - Show the decomposition chart larger.
   - Add a data table with component/channel, contribution %, contribution value, and notes/category.

4. Contribution pie chart with 4-period comparison
   - Add a contribution pie/donut section that compares 4 periods side by side.
   - Default periods can be shown as Period 1, Period 2, Period 3, Period 4 unless the app already has named date ranges.
   - Each period will show contribution split by channel/component.

5. Effectiveness, ROI, and S+C+ROI period comparison
   - Add 4-period comparison views for:
     - Effectiveness
     - ROI
     - S+C+ROI, interpreted as Spend + Contribution + ROI
   - Use compact comparison cards/charts plus supporting tables so users can compare channel performance across periods.

6. Response curves period filter
   - Add a period filter control to response curves.
   - Selecting a period updates the response curve data shown.
   - Include an “All periods” option for the current combined view.

Technical details:
- Primary file: `src/components/chat/cards/ModelResultsCard.tsx`.
- Reuse the current `ChartPanel`, chart data arrays, and dashboard layout where possible.
- Add local React state for:
  - selected expanded chart
  - response curve period filter
- Keep styling aligned with the existing design system using semantic Tailwind tokens only.
- Avoid duplicating dashboard logic between inline, drawer, and new-tab views by keeping the shared `FullResultsDashboard` component as the source of truth.