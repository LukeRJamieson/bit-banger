import * as vscode from 'vscode';

var testthing: number = 0;
export function activate(context: vscode.ExtensionContext) {


	let hover = vscode.languages.registerHoverProvider({ scheme: 'file', language: '*' }, {
		provideHover(document, position, token): vscode.ProviderResult<vscode.Hover> {
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);

			const hexRegex = /0[xX][0-9a-fA-F]/;
			if (hexRegex.test(word)) {
				const decimal = parseInt(word, 16);
				const binary = toggleBits(decimal, position);
				const markdownContent = updateMarkdown(binary);
				const hoverContent = new vscode.Hover(markdownContent.contents);
				return hoverContent;
			}

			if (/\bint\b/.test(word)) {
				const markdownContent = new vscode.MarkdownString(testthing.toString());
				const hoverContent = new vscode.Hover(markdownContent);
				return hoverContent;
			}

		}
	});
	context.subscriptions.push(vscode.commands.registerCommand('bit-banger.toggle', toggle));
	context.subscriptions.push(hover);
}
setInterval(increment,1000);
function increment()
{
	testthing++;
}

function updateMarkdown(binary: string)
{
	const markdownContent = new vscode.MarkdownString(binary);
	markdownContent.isTrusted = true;
	return new vscode.Hover(markdownContent);
}


function toggleBits(dec: number, VS_position: vscode.Position) {
	const bits = dec.toString(2).padStart(8, '0');
	let pos = bits.length;
	const bitLinks = bits
		.split("")
		.map((val) => {
			--pos;
			const commandArg = encodeURI(JSON.stringify({ dec, VS_position, pos, val ,bits}));
			return `[${val}](command:bit-banger.toggle?${commandArg})`;
		})
		.join('');
	return bitLinks;
}

export function toggle(uri: vscode.Uri) {
	const uriJSON = JSON.stringify(uri);
	const { dec, VS_position, pos, val, bits } = JSON.parse(uriJSON);
	var newVal = dec;
	if (val === '1')
	{
		newVal = newVal - (1<<pos);
	}
	else
	{
		newVal = newVal + (1<<pos);
	}
	
	const activeEditor = vscode.window.activeTextEditor;
	if(!activeEditor)
	{
		return;
	}
	const line = VS_position.line;
	const character = VS_position.character;
	const document = activeEditor.document;
	const range = document.getWordRangeAtPosition(new vscode.Position(line,character));
	if(!range)
	{
		return;
	}

	const edit = new vscode.WorkspaceEdit();
	edit.replace(document.uri,range,'0x' + newVal.toString(16).toUpperCase().padStart(2,'0'));

	vscode.workspace.applyEdit(edit);

	/* This was testing to see if MARKDOWN while looking at it...... it doesn't */
	const binary = toggleBits(newVal,VS_position);
	const markdownContent = updateMarkdown(binary);
	const hoverContent = new vscode.Hover(markdownContent.contents);
	return hoverContent;
}

export function deactivate() { }
