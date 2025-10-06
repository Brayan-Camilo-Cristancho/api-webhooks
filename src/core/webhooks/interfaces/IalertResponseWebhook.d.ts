export interface AlertResponse {
	event: string;
	message: string;
	repository?: string | undefined;
	branch?: string | undefined;
	alert: string;
	category: 'high' | 'medium' | 'low' | 'success' | 'notify' | 'error';
	sourceUrl?: string;
	actor?: string;
}
