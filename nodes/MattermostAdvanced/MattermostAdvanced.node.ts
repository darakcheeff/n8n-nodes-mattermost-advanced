import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class MattermostAdvanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mattermost Advanced',
		name: 'mattermostAdvanced',
		icon: 'file:mattermost.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Advanced Mattermost integration supporting post editing, file uploads, threads, direct messages, and dynamic attachments',
		defaults: {
			name: 'Mattermost Advanced',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'mattermostAdvancedApi',
				required: false,
			},
			{
				name: 'mattermostApi',
				required: false,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Channel',
						value: 'channel',
					},
					{
						name: 'Reaction',
						value: 'reaction',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'message',
			},

			// ----------------------------------------------------------------
			// OPERATIONS: Message
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Create / Post',
						value: 'post',
						description: 'Create and send a new message or thread reply',
						action: 'Post a message',
					},
					{
						name: 'Update / Edit',
						value: 'update',
						description: 'Update/edit an existing post (e.g. modify text, add interactive buttons/attachments)',
						action: 'Update a post',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a post by ID',
						action: 'Get a post',
					},
					{
						name: 'Get Thread',
						value: 'getThread',
						description: 'Get all posts in a thread for a post ID',
						action: 'Get a post thread',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for posts matching terms across channels',
						action: 'Search posts',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a post',
						action: 'Delete a post',
					},
					{
						name: 'Post Ephemeral',
						value: 'postEphemeral',
						description: 'Post a temporary message visible only to a specific user',
						action: 'Post an ephemeral message',
					},
					{
						name: 'Pin',
						value: 'pin',
						description: 'Pin a post to the channel',
						action: 'Pin a post',
					},
					{
						name: 'Unpin',
						value: 'unpin',
						description: 'Unpin a post from the channel',
						action: 'Unpin a post',
					},
				],
				default: 'post',
			},

			// Message > post parameters
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post', 'postEphemeral'],
					},
				},
				description: 'ID of the channel to post the message to',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['postEphemeral'],
					},
				},
				description: 'ID of the user who will exclusively see the ephemeral message',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post', 'postEphemeral', 'update'],
					},
				},
				description: 'The text of the message. Markdown formatting is supported.',
			},
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['update', 'get', 'getThread', 'delete', 'pin', 'unpin'],
					},
				},
				description: 'ID of the post to operate on',
			},
			{
				displayName: 'Thread Root Post ID',
				name: 'rootId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post', 'postEphemeral'],
					},
				},
				description: 'If specified, the message will be sent as a threaded reply to this post',
			},
			{
				displayName: 'File IDs',
				name: 'fileIds',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post'],
					},
				},
				description: 'Comma-separated file IDs (or JSON array) to attach to the post. Files can be uploaded using the File resource.',
			},
			{
				displayName: 'Attachments Mode',
				name: 'attachmentsMode',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Raw JSON / Code (Buttons & Menus)',
						value: 'rawJson',
						description: 'Pass dynamic buttons, actions, and interactive elements directly as a JSON array',
					},
				],
				default: 'none',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post', 'update'],
					},
				},
				description: 'How to specify message attachments (e.g. interactive buttons)',
			},
			{
				displayName: 'Attachments JSON',
				name: 'attachmentsJson',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '[]',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['post', 'update'],
						attachmentsMode: ['rawJson'],
					},
				},
				description: 'JSON array of attachments with actions/buttons (e.g. generated dynamically by an upstream Code node)',
			},
			{
				displayName: 'Search Terms',
				name: 'terms',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['search'],
					},
				},
				description: 'The search terms to look for (supports quotes, from:user, in:channel, etc.)',
			},
			{
				displayName: 'Is OR Search',
				name: 'isOrSearch',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['search'],
					},
				},
				description: 'Whether any of the terms can match (OR) instead of all matching (AND)',
			},

			// ----------------------------------------------------------------
			// OPERATIONS: File
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a binary file from n8n into a channel',
						action: 'Upload a file',
					},
					{
						name: 'Get Info',
						value: 'get',
						description: 'Get metadata for a file',
						action: 'Get file info',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download a file from Mattermost into binary data',
						action: 'Download a file',
					},
				],
				default: 'upload',
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				description: 'ID of the channel to upload the file to',
			},
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				description: 'Name of the binary property in the incoming item containing the file to upload',
			},
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['get', 'download'],
					},
				},
				description: 'ID of the file in Mattermost',
			},
			{
				displayName: 'Output Binary Property',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['download'],
					},
				},
				description: 'Name of the binary property to save the downloaded file to',
			},

			// ----------------------------------------------------------------
			// OPERATIONS: Channel
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['channel'],
					},
				},
				options: [
					{
						name: 'Create Direct Message (DM)',
						value: 'createDirect',
						description: 'Create or get an existing direct message channel between the bot and a target user',
						action: 'Create direct message channel',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get channel details by ID',
						action: 'Get channel details',
					},
					{
						name: 'Update / Patch',
						value: 'update',
						description: 'Update channel display name, header, or purpose',
						action: 'Update channel',
					},
					{
						name: 'Get Members',
						value: 'members',
						description: 'Get members of a channel',
						action: 'Get channel members',
					},
					{
						name: 'Add Member',
						value: 'addUser',
						description: 'Add a user to a channel',
						action: 'Add member to channel',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search channels by name',
						action: 'Search channels',
					},
				],
				default: 'createDirect',
			},
			{
				displayName: 'Target User ID',
				name: 'userId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['createDirect', 'addUser'],
					},
				},
				description: 'ID of the target user',
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['get', 'update', 'members'],
					},
				},
				description: 'ID of the channel',
			},
			{
				displayName: 'Channel Header',
				name: 'header',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['update'],
					},
				},
				description: 'Markdown text displayed in the channel header',
			},
			{
				displayName: 'Channel Purpose',
				name: 'purpose',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['update'],
					},
				},
				description: 'Description of the channel purpose',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['update'],
					},
				},
				description: 'New display name for the channel',
			},
			{
				displayName: 'Search Term',
				name: 'term',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['search'],
					},
				},
				description: 'Term to search channels by',
			},

			// ----------------------------------------------------------------
			// OPERATIONS: Reaction
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['reaction'],
					},
				},
				options: [
					{
						name: 'Add Reaction',
						value: 'create',
						description: 'Add an emoji reaction to a post',
						action: 'Add reaction to post',
					},
					{
						name: 'Remove Reaction',
						value: 'delete',
						description: 'Remove an emoji reaction from a post',
						action: 'Remove reaction from post',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all emoji reactions for a post',
						action: 'Get all reactions',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['reaction'],
					},
				},
				description: 'ID of the post',
			},
			{
				displayName: 'Emoji Name',
				name: 'emojiName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['reaction'],
						operation: ['create', 'delete'],
					},
				},
				description: 'Name of the emoji (e.g. "+1", "white_check_mark", "fire")',
			},

			// ----------------------------------------------------------------
			// OPERATIONS: User
			// ----------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get Current User / Bot (Me)',
						value: 'getMe',
						description: 'Get profile information of the authenticated user or bot',
						action: 'Get authenticated user info',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Get a user by their user ID',
						action: 'Get user by id',
					},
					{
						name: 'Get by Username',
						value: 'getByUsername',
						description: 'Get a user by username',
						action: 'Get user by username',
					},
					{
						name: 'Set Custom Status',
						value: 'setStatus',
						description: 'Set custom emoji status and text for the bot / user',
						action: 'Set custom status',
					},
				],
				default: 'getMe',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getById'],
					},
				},
				description: 'ID of the user',
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getByUsername'],
					},
				},
				description: 'Username of the user',
			},
			{
				displayName: 'Status Emoji',
				name: 'statusEmoji',
				type: 'string',
				default: 'robot',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['setStatus'],
					},
				},
				description: 'Emoji for the custom status (e.g. "robot", "speech_balloon", "eyes")',
			},
			{
				displayName: 'Status Text',
				name: 'statusText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['setStatus'],
					},
				},
				description: 'Text to display next to the status emoji',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Resolve Credentials
		let baseUrl = '';
		let accessToken = '';

		try {
			const advancedCreds = await this.getCredentials('mattermostAdvancedApi');
			if (advancedCreds?.baseUrl && advancedCreds?.accessToken) {
				baseUrl = String(advancedCreds.baseUrl).replace(/\/+$/, '');
				accessToken = String(advancedCreds.accessToken);
			}
		} catch (e) {}

		if (!baseUrl || !accessToken) {
			try {
				const standardCreds = await this.getCredentials('mattermostApi');
				if (standardCreds?.baseUrl && standardCreds?.accessToken) {
					baseUrl = String(standardCreds.baseUrl).replace(/\/+$/, '');
					accessToken = String(standardCreds.accessToken);
				}
			} catch (e) {}
		}

		if (!baseUrl || !accessToken) {
			throw new NodeOperationError(
				this.getNode(),
				'Mattermost credentials missing! Please configure either Mattermost Advanced API or Mattermost API credential.',
			);
		}

		const makeRequest = async (
			method: IHttpRequestMethods,
			endpoint: string,
			body?: any,
			headers?: IDataObject,
			isBinary = false,
		) => {
			const url = `${baseUrl}/api/v4${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
			const reqHeaders: IDataObject = {
				Authorization: `Bearer ${accessToken}`,
				...(headers || {}),
			};

			const options: any = {
				method,
				url,
				headers: reqHeaders,
				json: !isBinary,
			};

			if (body !== undefined) {
				options.body = body;
			}

			if (isBinary) {
				options.encoding = null;
			}

			return await this.helpers.request(options);
		};

		// Helper to resolve current bot user ID
		let currentUserId = '';
		const getCurrentUserId = async () => {
			if (!currentUserId) {
				const me = await makeRequest('GET', '/users/me');
				currentUserId = me.id;
			}
			return currentUserId;
		};

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				// ============================================================
				// RESOURCE: MESSAGE
				// ============================================================
				if (resource === 'message') {
					if (operation === 'post') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const message = this.getNodeParameter('message', i, '') as string;
						const rootId = this.getNodeParameter('rootId', i, '') as string;
						const fileIdsRaw = this.getNodeParameter('fileIds', i, '') as string;
						const attachmentsMode = this.getNodeParameter('attachmentsMode', i, 'none') as string;

						const postBody: IDataObject = {
							channel_id: channelId,
							message,
						};

						if (rootId) {
							postBody.root_id = rootId;
						}

						if (fileIdsRaw) {
							if (Array.isArray(fileIdsRaw)) {
								postBody.file_ids = fileIdsRaw;
							} else if (fileIdsRaw.startsWith('[')) {
								try {
									postBody.file_ids = JSON.parse(fileIdsRaw);
								} catch (e) {
									postBody.file_ids = fileIdsRaw.split(',').map((id) => id.trim());
								}
							} else {
								postBody.file_ids = fileIdsRaw.split(',').map((id) => id.trim());
							}
						}

						if (attachmentsMode === 'rawJson') {
							const attachmentsJson = this.getNodeParameter('attachmentsJson', i, '[]') as string;
							let attachments = [];
							try {
								attachments = typeof attachmentsJson === 'string' ? JSON.parse(attachmentsJson) : attachmentsJson;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Attachments JSON parameter');
							}
							postBody.props = {
								...(postBody.props as IDataObject || {}),
								attachments,
							};
						}

						responseData = await makeRequest('POST', '/posts', postBody);
					} else if (operation === 'update') {
						const postId = this.getNodeParameter('postId', i) as string;
						const message = this.getNodeParameter('message', i, '') as string;
						const attachmentsMode = this.getNodeParameter('attachmentsMode', i, 'none') as string;

						const updateBody: IDataObject = {
							id: postId,
						};

						if (message) {
							updateBody.message = message;
						}

						if (attachmentsMode === 'rawJson') {
							const attachmentsJson = this.getNodeParameter('attachmentsJson', i, '[]') as string;
							let attachments = [];
							try {
								attachments = typeof attachmentsJson === 'string' ? JSON.parse(attachmentsJson) : attachmentsJson;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Attachments JSON parameter');
							}
							updateBody.props = {
								attachments,
							};
						}

						// Mattermost accepts PUT /posts/{postId} or PATCH /posts/{postId}/patch
						responseData = await makeRequest('PUT', `/posts/${postId}`, updateBody);
					} else if (operation === 'get') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('GET', `/posts/${postId}`);
					} else if (operation === 'getThread') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('GET', `/posts/${postId}/thread`);
					} else if (operation === 'delete') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('DELETE', `/posts/${postId}`);
					} else if (operation === 'postEphemeral') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const message = this.getNodeParameter('message', i, '') as string;
						const rootId = this.getNodeParameter('rootId', i, '') as string;

						const ephemeralPost: IDataObject = {
							channel_id: channelId,
							message,
						};
						if (rootId) {
							ephemeralPost.root_id = rootId;
						}

						responseData = await makeRequest('POST', '/posts/ephemeral', {
							user_id: userId,
							post: ephemeralPost,
						});
					} else if (operation === 'search') {
						const terms = this.getNodeParameter('terms', i) as string;
						const isOrSearch = this.getNodeParameter('isOrSearch', i, false) as boolean;
						responseData = await makeRequest('POST', '/posts/search', {
							terms,
							is_or_search: isOrSearch,
						});
					} else if (operation === 'pin') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('POST', `/posts/${postId}/pin`);
					} else if (operation === 'unpin') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('POST', `/posts/${postId}/unpin`);
					}

				// ============================================================
				// RESOURCE: FILE
				// ============================================================
				} else if (resource === 'file') {
					if (operation === 'upload') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = binaryData.fileName || 'file';

						const FormData = require('form-data');
						const formData = new FormData();
						formData.append('channel_id', channelId);
						formData.append('files', fileBuffer, {
							filename: fileName,
							contentType: binaryData.mimeType,
						});

						const url = `${baseUrl}/api/v4/files`;
						const headers = {
							Authorization: `Bearer ${accessToken}`,
							...formData.getHeaders(),
						};

						responseData = await this.helpers.request({
							method: 'POST',
							url,
							headers,
							body: formData,
							json: true,
						});
					} else if (operation === 'get') {
						const fileId = this.getNodeParameter('fileId', i) as string;
						responseData = await makeRequest('GET', `/files/${fileId}/info`);
					} else if (operation === 'download') {
						const fileId = this.getNodeParameter('fileId', i) as string;
						const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;

						const fileInfo = await makeRequest('GET', `/files/${fileId}/info`);
						const buffer = await makeRequest('GET', `/files/${fileId}`, undefined, undefined, true);

						const binary = await this.helpers.prepareBinaryData(
							buffer,
							fileInfo.name || `file_${fileId}`,
							fileInfo.mime_type || 'application/octet-stream',
						);

						returnData.push({
							json: fileInfo,
							binary: {
								[outputBinaryPropertyName]: binary,
							},
							pairedItem: { item: i },
						});
						continue;
					}

				// ============================================================
				// RESOURCE: CHANNEL
				// ============================================================
				} else if (resource === 'channel') {
					if (operation === 'createDirect') {
						const targetUserId = this.getNodeParameter('userId', i) as string;
						const myUserId = await getCurrentUserId();
						responseData = await makeRequest('POST', '/channels/direct', [myUserId, targetUserId]);
					} else if (operation === 'get') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await makeRequest('GET', `/channels/${channelId}`);
					} else if (operation === 'update') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const header = this.getNodeParameter('header', i, '') as string;
						const purpose = this.getNodeParameter('purpose', i, '') as string;
						const displayName = this.getNodeParameter('displayName', i, '') as string;

						const patchBody: IDataObject = {};
						if (header) patchBody.header = header;
						if (purpose) patchBody.purpose = purpose;
						if (displayName) patchBody.display_name = displayName;

						responseData = await makeRequest('PUT', `/channels/${channelId}/patch`, patchBody);
					} else if (operation === 'members') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await makeRequest('GET', `/channels/${channelId}/members`);
					} else if (operation === 'addUser') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await makeRequest('POST', `/channels/${channelId}/members`, {
							user_id: userId,
						});
					} else if (operation === 'search') {
						const term = this.getNodeParameter('term', i) as string;
						responseData = await makeRequest('POST', '/channels/search', { term });
					}

				// ============================================================
				// RESOURCE: REACTION
				// ============================================================
				} else if (resource === 'reaction') {
					const postId = this.getNodeParameter('postId', i) as string;
					if (operation === 'create') {
						const emojiName = this.getNodeParameter('emojiName', i) as string;
						const userId = await getCurrentUserId();
						responseData = await makeRequest('POST', '/reactions', {
							user_id: userId,
							post_id: postId,
							emoji_name: emojiName.replace(/:/g, ''),
						});
					} else if (operation === 'delete') {
						const emojiName = this.getNodeParameter('emojiName', i) as string;
						const userId = await getCurrentUserId();
						responseData = await makeRequest(
							'DELETE',
							`/users/${userId}/posts/${postId}/reactions/${emojiName.replace(/:/g, '')}`,
						);
					} else if (operation === 'getAll') {
						responseData = await makeRequest('GET', `/posts/${postId}/reactions`);
					}

				// ============================================================
				// RESOURCE: USER
				// ============================================================
				} else if (resource === 'user') {
					if (operation === 'getMe') {
						responseData = await makeRequest('GET', '/users/me');
					} else if (operation === 'getById') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await makeRequest('GET', `/users/${userId}`);
					} else if (operation === 'getByUsername') {
						const username = this.getNodeParameter('username', i) as string;
						responseData = await makeRequest('GET', `/users/username/${username}`);
					} else if (operation === 'setStatus') {
						const myUserId = await getCurrentUserId();
						const emoji = this.getNodeParameter('statusEmoji', i, 'robot') as string;
						const text = this.getNodeParameter('statusText', i, '') as string;
						responseData = await makeRequest('PUT', `/users/${myUserId}/status/custom`, {
							emoji: emoji.replace(/:/g, ''),
							text,
						});
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
