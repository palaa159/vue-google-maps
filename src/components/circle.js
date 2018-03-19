import clone from 'lodash/clone'

import eventBinder from '../utils/eventsBinder.js'
import propsBinder from '../utils/propsBinder.js'
import MapElementMixin from './mapElementMixin'
import getPropsValuesMixin from '../utils/getPropsValuesMixin.js'

var props = {
  center: {
    type: Object,
    twoWay: true,
    required: true
  },
  radius: {
    type: Number,
    default: 1000,
    twoWay: true
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    twoWay: false
  }
}

var events = [
  'click',
  'dblclick',
  'drag',
  'dragend',
  'dragstart',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'rightclick'
]

export default {
  mixins: [MapElementMixin, getPropsValuesMixin],
  props: props,
  version: 2,

  render () { return '' },

  deferredReady () {
    var options = clone(this.getPropsValues())
    options.map = this.$map
    delete options.bounds
    this.createCircle(options)
  },

  methods: {
    createCircle (options) {
      this.$circleObject = new google.maps.Circle(options)
      // we cant bind bounds because there is no `setBounds` method
      // on the Circle object
      var boundProps = clone(props)
      delete boundProps.bounds
      propsBinder(this, this.$circleObject, boundProps)
      eventBinder(this, this.$circleObject, events)

      var updateBounds = () => {
        this.$emit('bounds_changed', this.$circleObject.getBounds())
      }

      this.$on('radius_changed', updateBounds)
      this.$on('center_changed', updateBounds)
    }
  },

  destroyed () {
    if (this.$circleObject) {
      this.$circleObject.setMap(null)
    }
  },
}
