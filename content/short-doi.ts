declare const Zotero: any

import Cache = require('./db/cache.ts')
import debug = require('./debug.ts')

export = long => {
  const cache = Cache.getCollection('DOI')
  if (!cache) return null

  const cached = cache.findOne({ long })
  if (cache) return cached.short

  try {
    const short = Zotero.File.getContentsFromURL(`http://shortdoi.org/${long}?format=json`)
    if (!short) return null
    const parsed = JSON.parse(short)
    cache.insert({ long, short: parsed.ShortDOI })
    return parsed.ShortDOI
  } catch (err) {
    debug('shortDOI:', err)
  }

  return null
}
