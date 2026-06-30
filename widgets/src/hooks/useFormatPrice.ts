import type { App } from '@modelcontextprotocol/ext-apps';

export function useFormatPrice(app: App | null) {
	// TODO: Use host locale
	const locale = app?.getHostContext()?.locale ?? "en-US";
	return (price: number) =>
		new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'USD',
		}).format(price);
}
