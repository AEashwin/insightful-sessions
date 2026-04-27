Plan to add the new-tab popout option:

1. Update the Model Results dashboard toolbar
   - Keep the current square popout button for the in-app right-side panel.
   - Add a second adjacent button for “Pop out to new tab”.
   - Use a clear icon/label treatment so users can distinguish:
     - in-app popout/drawer
     - new browser tab

2. Implement the new-tab behavior
   - Add a click handler that opens a focused dashboard route or URL in a new tab using `window.open(..., '_blank', 'noopener,noreferrer')`.
   - If no dedicated full-screen route exists yet, create a lightweight full-page dashboard view that renders the same `FullResultsDashboard` content.

3. Reuse the existing dashboard UI
   - Avoid duplicating chart/table logic.
   - Share the current model output dashboard component between:
     - inline accordion
     - in-app slide-over panel
     - new-tab full-page dashboard

Technical details:
- Main file to update: `src/components/chat/cards/ModelResultsCard.tsx`.
- Likely route update: `src/App.tsx` if a new `/model-results` or similar full-screen route is needed.
- Use existing semantic Tailwind tokens and existing `Button` styles.
- Use Lucide icons already available in the project for the new-tab action.