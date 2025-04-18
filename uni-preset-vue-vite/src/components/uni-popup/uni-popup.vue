<template>
  <view v-if="showPopup" class="uni-popup" :class="[position]">
    <view class="uni-popup-mask" @click="onMaskClick"></view>
    <view class="uni-popup-container">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniPopup',
  props: {
    type: {
      type: String,
      default: 'center'
    },
    maskClick: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPopup: false,
      position: 'center'
    };
  },
  watch: {
    type: {
      handler(type) {
        this.position = type;
      },
      immediate: true
    }
  },
  methods: {
    open() {
      this.showPopup = true;
    },
    close() {
      this.showPopup = false;
    },
    onMaskClick() {
      if (this.maskClick) {
        this.close();
      }
    }
  }
}
</script>

<style>
.uni-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uni-popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.uni-popup-container {
  position: relative;
  z-index: 10;
}

.uni-popup.center {
  justify-content: center;
  align-items: center;
}

.uni-popup.top {
  justify-content: center;
  align-items: flex-start;
}

.uni-popup.bottom {
  justify-content: center;
  align-items: flex-end;
}
</style> 