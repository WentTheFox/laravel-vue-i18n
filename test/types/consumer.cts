import runtime = require('@wentthefox-forks/laravel-vue-i18n')
import plugin = require('@wentthefox-forks/laravel-vue-i18n/vite')

new runtime.I18n({ resolve: (lang) => ({ hello: lang }) })
plugin.default()
