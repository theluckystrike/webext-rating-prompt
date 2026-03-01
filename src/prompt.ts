/**
 * Rating Prompt — Smart, non-intrusive rating request UI
 */
export class RatingPrompt {
    private storageKey = '__rating_prompt__';

    /** Check if should show prompt (usage-based) */
    async shouldShow(minUses: number = 10, minDays: number = 3): Promise<boolean> {
        const data = await this.getData();
        if (data.dismissed || data.rated) return false;
        const daysSince = (Date.now() - data.firstUse) / 86400000;
        return data.useCount >= minUses && daysSince >= minDays;
    }

    /** Track a usage event */
    async trackUse(): Promise<void> {
        const data = await this.getData();
        data.useCount++;
        if (!data.firstUse) data.firstUse = Date.now();
        await chrome.storage.local.set({ [this.storageKey]: data });
    }

    /** Show rating prompt UI */
    show(containerId: string, extensionId?: string): void {
        const container = document.getElementById(containerId);
        if (!container) return;
        const cwsUrl = `https://chromewebstore.google.com/detail/${extensionId || chrome.runtime.id}/reviews`;
        container.innerHTML = `
      <div style="font-family:-apple-system,sans-serif;padding:20px;border:1px solid #E5E7EB;border-radius:12px;background:#fff;max-width:340px;margin:auto;box-shadow:0 4px 12px rgba(0,0,0,0.06)">
        <div style="text-align:center;margin-bottom:12px"><span style="font-size:32px">⭐️</span></div>
        <h3 style="margin:0 0 8px;text-align:center;font-size:16px;font-weight:600;color:#1F2937">Enjoying this extension?</h3>
        <p style="margin:0 0 16px;text-align:center;font-size:13px;color:#6B7280;line-height:1.5">Your review helps other developers discover this tool.</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <a href="${cwsUrl}" target="_blank" id="__rate_yes__" style="display:block;text-align:center;padding:10px;background:#3B82F6;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">⭐ Rate on Chrome Web Store</a>
          <button id="__rate_later__" style="padding:8px;background:none;border:none;color:#9CA3AF;font-size:13px;cursor:pointer">Maybe Later</button>
        </div>
      </div>`;
        container.querySelector('#__rate_yes__')?.addEventListener('click', () => { this.markRated(); container.innerHTML = ''; });
        container.querySelector('#__rate_later__')?.addEventListener('click', () => { this.markDismissed(); container.innerHTML = ''; });
    }

    /** Mark as rated */
    async markRated(): Promise<void> { const d = await this.getData(); d.rated = true; await chrome.storage.local.set({ [this.storageKey]: d }); }

    /** Mark as dismissed */
    async markDismissed(): Promise<void> { const d = await this.getData(); d.dismissed = true; d.dismissedAt = Date.now(); await chrome.storage.local.set({ [this.storageKey]: d }); }

    private async getData(): Promise<any> {
        const result = await chrome.storage.local.get(this.storageKey);
        return result[this.storageKey] || { useCount: 0, firstUse: 0, dismissed: false, rated: false };
    }
}
