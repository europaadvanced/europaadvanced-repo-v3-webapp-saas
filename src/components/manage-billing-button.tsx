'use client';

export default function ManageBillingButton() {
  async function handleClick() {
    const res = await fetch('/api/portal', { method: 'POST' });
    if (!res.ok) { alert('Could not open billing portal'); return; }
    const { url } = await res.json();
    window.location.assign(url);
  }
  return (
    <button className="border px-3 py-2 rounded" onClick={handleClick}>
      Manage billing
    </button>
  );
}
