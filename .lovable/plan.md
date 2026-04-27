Plan to update the Model Results experience:

1. Keep the results card compact by default
- Leave the key metrics, 52/48 split, and short ROI summary visible.
- Move the dense chart grid out of the always-visible body so the chat stays lightweight.

2. Add a styled CTA button
- Replace the current footer action with a primary button: “View Dashboard”.
- Clicking it will open an expanded dashboard panel, not navigate away and not use a plain hyperlink.

3. Add an expanded dashboard panel below the card
- Implement an accordion-style expansion directly under the compact summary.
- Include breadcrumb text at the top: “Model 1 › Full Results”.
- Include a top-right “Open in full screen ↗” icon button as a secondary power-user action.

4. Put the full dashboard content inside the expanded panel
- Charts: Model fit, Decomposition, Response curves / due-to style contribution view, ROI, Effectiveness.
- Full ROI table with spend, contribution, ROI, and status coloring.
- Filters / toggles row for options such as Channel group, View type, and Include base.
- Export button in the dashboard header.

5. Keep flow and modelling logic unchanged
- Only update `ModelResultsCard.tsx` UI/state for the expand/collapse dashboard interaction.
- Reuse the existing static chart data and semantic design tokens.
- No changes to the chat chain, message flow, routing, or backend.

Technical notes:
- Use local React state in `ModelResultsCard` to toggle the expanded panel.
- Use existing shadcn-style `Button`, `Badge`, and semantic Tailwind tokens.
- If the panel feels too dense after implementation, structure it as a right-side drawer using the existing drawer component, but the first pass will follow your requested “slides open below” pattern.