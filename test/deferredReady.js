import Lab from 'lab'
import {jsdom} from 'jsdom'
import {DeferredReadyMixin} from '../src/utils/deferredReady'
import {expect} from 'code'

export var lab = Lab.script()

global.document = jsdom('')
global.window = document.defaultView

var VueRoot = require('vue/dist/vue')

lab.experiment('Deferred Ready', function () {
  var Vue

  lab.beforeEach(async () => {
    document.body.innerHTML = ''
    document.body.innerHTML = '<div id="root"></div>'

    Vue = VueRoot.extend({})
  })

  lab.test('Hook is executed', async function () {
    await new Promise((resolve, reject) => {
      window.document.getElementById('root').innerHTML = `
      <dr-comp></dr-comp>
      `

      Vue.component('drComp', {
        template: '<span>Test</span>',
        mixins: [DeferredReadyMixin],
        deferredReady () {
          resolve()
        }
      })

      new Vue({ // eslint-disable-line
        el: window.document.getElementById('root'),
      })
    })
  })

  lab.test('Hook is executed in order', async function () {
    await new Promise((resolve, reject) => {
      window.document.getElementById('root').innerHTML = `
      <parent-comp></parent-comp>
      `

      var flag = false

      function delay (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      var childComp = Vue.component('childComp', {
        template: '<span>Test</span>',
        mixins: [DeferredReadyMixin],
        deferredReady () {
          try {
            expect(flag).true()
            resolve()
          } catch (err) {
            reject(err)
          }
        }
      })

      Vue.component('parentComp', {
        components: {
          childComp
        },
        template: '<child-comp></child-comp>',
        mixins: [DeferredReadyMixin],
        async deferredReady () {
          await delay(500)
          flag = true
        }
      })

      new Vue({ // eslint-disable-line
        el: window.document.getElementById('root'),
      })
    })
  })

  lab.test('No ancestor, hook is still executed', async function () {
    await new Promise((resolve, reject) => {
      window.document.getElementById('root').innerHTML = `
      <parent-comp></parent-comp>
      `

      var flag = false

      function delay (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      var childComp = Vue.component('childComp', {
        template: '<span>Test</span>',
        mixins: [DeferredReadyMixin],
        deferredReady () {
          try {
            expect(flag).false()
            resolve()
          } catch (err) {
            reject(err)
          }
        }
      })

      Vue.component('parentComp', {
        components: {
          childComp
        },
        template: '<child-comp></child-comp>',
        async deferredReady () {
          await delay(500)
          flag = true
        }
      })

      new Vue({ // eslint-disable-line
        el: window.document.getElementById('root'),
      })
    })
  })
})
