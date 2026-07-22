/* The one marble element in the document. Mounted once, as a sibling to
   the app content (never nested inside it), so no ancestor of the slab
   can ever pick up a transform/filter/backdrop-filter that would break
   its position: fixed. See src/styles/marble.css and MARBLE-CONTRACT.md. */

export function MarbleSlab() {
  return <div className="marble-slab" aria-hidden="true" data-testid="marble-slab" />;
}
