declare const Zotero: any

import Cache = require('./db/cache.ts')
import debug = require('./debug.ts')

export = new class ShortDOI {
  private cache: any

	constructor() {
		this.prefix = 'DOI:'
    this.preflxLength = prefix.length
	}

  public get(item) {
    let short = this.scan(item.getField('extra'))
    if (short) return short
    try {
      return this.short(item.getField('DOI'))
    } catch (err) {
      debug('could not get DOI field')
    }
    return null
  }

  public short(doi) {
    if (!doi) return null

    this.cache = this.cache || Cache.getCollection('DOI')
    if (!this.cache) {
      debug('DOI Cache not loaded, try later')
      return null
    }

    const cached = this.cache.findOne({ $or: [ { long: doi }, { short: doi } ] })
    if (cached) {
      this.cache.update(cached) // touches the cache entry
      return cached.short
    }

    try {
      const short = Zotero.File.getContentsFromURL(`http://shortdoi.org/${long}?format=json`)
      if (!short) return null
      const parsed = JSON.parse(short)
      cache.insert({ long: doi, short: parsed.ShortDOI })
      return parsed.ShortDOI
    } catch (err) {
      debug('shortDOI:', err)
    }

    return null
  }

	public scan(extra) {
		if (!extra) return null

    for (const line of item.extra.split('\n').filter(line => line.startsWith(this.prefix))) {
      const short = this.short(line.substring(this.prefixLength).trim())
      if (short) return short
    }

    return null
  }

  public update(items) {
    for (const item in items) {
      this.get(item)
    }
  }
}
