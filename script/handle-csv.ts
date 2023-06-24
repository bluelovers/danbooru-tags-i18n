/**
 * Created by user on 2023/6/24.
 */

import { initIdeaSegmentText, processTextSync } from '../src/lib/segment';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { __ROOT } from '../test/__root';
import { parse, stringify as csvStringify, transform } from 'csv';

initIdeaSegmentText()
	.then(async () =>
	{

// Run the pipeline
		createReadStream(join(__ROOT, 'src', 'crowdin', 'danbooru-tags.csv'))
			.pipe(parse({
				columns: ['tag', 'value'],
			}))
			.pipe(transform((record: {
				tag: string,
				value: string,
			}) =>
			{
				record.value = processTextSync(record.value);
				record.tag = record.tag.replace(/\uFEFF/g, '')

				return record;
			}))
			.pipe(csvStringify({
				quoted: true,
				bom: false,
			}))
			.pipe(createWriteStream(join(__ROOT, 'i18n', 'zh-TW', 'danbooru-tags-zh-TW.csv')));

	})
;
