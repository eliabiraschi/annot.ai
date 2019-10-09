<template>
    <f7-popup id="popup" :opened="opened">
      <f7-view navbar-fixed>
        <f7-pages>
          <f7-page>
            <f7-navbar :title="title">
              <f7-nav-right>
                <f7-link close-popup>Close</f7-link>
              </f7-nav-right>
            </f7-navbar>
            <f7-block>{{message}}</f7-block>
          </f7-page>
        </f7-pages>
      </f7-view>
    </f7-popup>
</template>

<script>
export default {
    name: 'pop-up',
    props: ['title', 'message', 'opened']
}
</script>