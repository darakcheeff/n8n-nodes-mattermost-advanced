import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MattermostAdvancedApi implements ICredentialType {
	name = 'mattermostAdvancedApi';
	displayName = 'Mattermost Advanced API';
	documentationUrl = 'https://docs.mattermost.com/developer/personal-access-tokens.html';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mattermost.example.com',
			placeholder: 'https://mattermost.example.com',
			required: true,
			description: 'Base URL of your Mattermost instance (e.g. https://mm.ansy.us)',
		},
		{
			displayName: 'Access Token / Bot Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Personal Access Token or Bot Access Token for Mattermost',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v4/users/me',
		},
	};
}
