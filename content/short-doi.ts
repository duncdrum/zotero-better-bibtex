declare const Zotero: any

import Cache = require('./db/cache.ts')
import Prefs = require('./prefs.ts')
import debug = require('./debug.ts')
import Events = require('./events.ts')

export = new class ShortDOI {
  private cache: any
  private preference = 'shortDOI'
  private prefixLength: number
  private prefix: string
  private enabled: string

  constructor() {
    this.prefix = 'DOI:'
    this.prefixLength = this.prefix.length
    this.enabled = Prefs.get(this.preference)

    Events.on('preference-changed', pref => {
      if (pref !== this.preference) return
      this.enabled = Prefs.get(this.preference)
    })
  }

  public get(item) {
    const short = this.scan(item.getField('extra'))
    if (short) return short
    try {
      return this.short(item.getField('DOI'))
    } catch (err) {
      debug('ShortDOI.get: could not get DOI field')
    }
    return null
  }

  public short(doi) {
    debug('ShortDOI.short:', {enabled: this.enabled, doi})
    if (!this.enabled || !doi) return null

    this.cache = this.cache || Cache.getCollection('DOI')
    if (!this.cache) {
      debug('ShortDOI.short: DOI Cache not loaded, try later')
      return null
    }

    const cached = this.cache.findOne({ $or: [ { long: doi }, { short: doi } ] })
    if (cached) {
      this.cache.update(cached) // touches the cache entry
      return cached.short
    }

    try {
      const short = Zotero.File.getContentsFromURL(`http://shortdoi.org/${doi}?format=json`)
      if (!short) return null
      const parsed = JSON.parse(short)
      debug('ShortDOI.short:', { long: doi, short: parsed })
      this.cache.insert({ long: doi, short: parsed.ShortDOI })
      return parsed.ShortDOI
    } catch (err) {
      debug('ShortDOI.short:', err)
    }

    return null
  }

  public scan(extra) {
    if (this.enabled !== 'scan' || !extra) return null

    for (const line of extra.split('\n')) {
      if (!line.startsWith(this.prefix)) continue
      const short = this.short(line.substring(this.prefixLength).trim())
      if (short) return short
    }

    return null
  }

  public update(items) {
    for (const item of items) {
      this.get(item)
    }
  }

  public resolve(items) {
  }
  Promise.all(promises.map(function(promise) {
    return promise.reflect();
})).each(function(inspection) {
    if (inspection.isFulfilled()) {
        console.log("A promise in the array was fulfilled with", inspection.value());
    } else {
        console.error("A promise in the array was rejected with", inspection.reason());
    }
});
}
