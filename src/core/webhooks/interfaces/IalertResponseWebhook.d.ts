export interface AlertResponse {
	event: string;
	message: string;
	repository?: string | undefined;
	branch?: string | undefined;
	alert: string;
}
