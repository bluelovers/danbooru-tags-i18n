/**
 * Created by user on 2023/6/24.
 */

import { initIdeaSegmentText, processTextSync } from '../src/lib/segment';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { __ROOT } from '../test/__root';
import { parse, stringify as csvStringify, transform } from 'csv';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'stream';
import { crlf, CRLF } from 'crlf-normalize';

function getOutputFilename(lang: 'zh-CN' | 'zh-TW')
{
	return join(__ROOT, 'i18n', lang, `danbooru-tags-${lang}.csv`)
}

initIdeaSegmentText()
	.then(async () =>
	{

		await transformCSV('zh-TW');
		await transformCSV('zh-CN');

	})
;

function transformLinebreak()
{
	return new Transform({
		transform(chunk, _encoding, callback)
		{
			const data = crlf(chunk.toString(), CRLF);
			callback(null, data);
		},
	})
}

function transformCSV(lang: 'zh-CN' | 'zh-TW')
{
	return pipeline(
		createReadStream(join(__ROOT, 'src', 'crowdin', 'danbooru-tags.csv')),
		parse({
			columns: ['tag', 'value'],
		}),
		transform((record: {
			tag: string,
			value: string,
		}) =>
		{
			if (lang === 'zh-CN')
			{
				record.value = processTextSync(record.value, {
					toCN: true,
					noSeg: true,
				});
			}
			else
			{
				record.value = processTextSync(record.value);
			}

			record.tag = record.tag.replace(/\uFEFF/g, '')

			return record;
		}),
		csvStringify({
			quoted: true,
			bom: true,
		}),
		transformLinebreak(),
		createWriteStream(getOutputFilename(lang)),
	)
}
