import { nextTick } from 'vue'
import { I18n } from '../src'

describe('translating leaves nothing subscribed behind', () => {
  // trans() and $t() run during a render, outside any effect scope. Anything they start there is never stopped
  // and stays subscribed to the long-lived activeMessages (a leak per translation, per request on a server).
  it('does not re-run any lookup when a language is loaded after many trans() calls', async () => {
    const i18n = new I18n()
    i18n.setLanguage({ lang: 'en', messages: { a: 'A', b: 'B' } })

    for (let i = 0; i < 50; i++) {
      i18n.trans('a')
      i18n.trans('b')
      i18n.trans('missing')
      i18n.transChoice('a', 1)
    }

    const findTranslation = vi.spyOn(i18n, 'findTranslation')
    i18n.setLanguage({ lang: 'pt', messages: { a: 'Á', b: 'Bê' } })
    await nextTick()

    expect(findTranslation).not.toHaveBeenCalled()
  })
})

describe('translations stay reactive', () => {
  it('updates a wTrans() ref when its language is loaded later', () => {
    const i18n = new I18n()
    const hello = i18n.wTrans('hello')

    expect(hello.value).toBe('hello')

    i18n.setLanguage({ lang: 'en', messages: { hello: 'Hi' } })
    expect(hello.value).toBe('Hi')

    i18n.setLanguage({ lang: 'pt', messages: { hello: 'Olá' } })
    expect(hello.value).toBe('Olá')
  })

  it('still falls back to the key, and to the dotted key for a slashed one', () => {
    const i18n = new I18n()
    i18n.setLanguage({ lang: 'en', messages: { 'group.title': 'Title' } })

    expect(i18n.trans('missing.key')).toBe('missing.key')
    expect(i18n.trans('group/title')).toBe('Title')
  })

  it('keeps replacements and pluralization working', () => {
    const i18n = new I18n()
    i18n.setLanguage({
      lang: 'en',
      messages: { welcome: 'Welcome, :name!', apples: '{0} none|{1} one|[2,*] :count apples' }
    })

    expect(i18n.trans('welcome', { name: 'Fox' })).toBe('Welcome, Fox!')
    expect(i18n.transChoice('apples', 5)).toBe('5 apples')
  })
})
