<template>
    <div id="app">
        <f7-statusbar></f7-statusbar>
        <right-panel></right-panel>
        <left-panel></left-panel>
        <!-- Pop-up
        <pop-up id="pop-up" :title="popup.title" :message="popup.message"></pop-up>-->
        <!-- Login Screen -->
        <login-screen></login-screen>
        <signup-screen></signup-screen>

        <!-- Actions
        <f7-actions>
            <f7-actions-group>
                <f7-actions-label>Hello</f7-actions-label>
                <f7-actions-button>Button 1</f7-actions-button>
                <f7-actions-button @click="doSomething()">Button 2</f7-actions-button>
            </f7-actions-group>
            <f7-actions-group>
                <f7-actions-button color="red" bold>Cancel</f7-actions-button>
            </f7-actions-group>
        </f7-actions> -->

        <f7-views>
            <f7-view id="main-view" navbar-through main>
                <f7-pages></f7-pages>
            </f7-view>
        </f7-views>
    </div>
</template>

<script>
export default {
    mounted () {
        setTimeout(() => {
            this.$f7.mainView.router.loadPage('/')
        }, 0)
    }
}
</script>

<style>
    .pointer {
        cursor: pointer;
    }
</style>