<template>
    <f7-login-screen id="signup-screen">
      <f7-view>
        <f7-pages>
          <f7-page login-screen>
            <f7-login-screen-title>Sign up</f7-login-screen-title>
            <f7-list form>
              <f7-list-item>
                <f7-label>Email</f7-label>
                <f7-input name="email" placeholder="email" v-model="email" type="text" required></f7-input>
              </f7-list-item>
              <f7-list-item>
                <f7-label>Password</f7-label>
                <f7-input name="password" type="password" v-model="password" placeholder="Password" required></f7-input>
              </f7-list-item>
              <f7-list-item v-if="!custom">
                <f7-button raised fill @click="submit()">Check credentials</f7-button>
              </f7-list-item>
              <f7-list-item v-if="custom">
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                    <input type="hidden" name="custom" v-model="custom">
                    <input type="hidden" name="cmd" value="_s-xclick">
                    <input type="hidden" name="hosted_button_id" value="">
                    <input type="hidden" name="on0" value="Billing Plans">
                    <li>
                        <div class="item-content">
                            <div class="item-inner">
                                <div class="item-title label">Select a billing plan:</div>
                                    <div class="item-input">
                                        <select name="os0" type="select">
	                                        <option value="Monthly">Monthly : €1.99 EUR</option>
	                                        <option value="Yearly">Yearly : €19.99 EUR</option>
                                        </select>
                                    </div>
                                </div>
                        </div>
                        <div class="ppButton">
                            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribe_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                            <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
                        </div>
                    </li>
                </form>
              </f7-list-item>
              <f7-list-item>
                <f7-button raised close-login-screen>Close</f7-button>
              </f7-list-item>
            </f7-list>
          </f7-page>
        </f7-pages>
      </f7-view>
    </f7-login-screen>
</template>

<script>
export default {
    name: 'signup-screen',
    data () {
        return {
            'email': '',
            'password': '',
            'custom': false
        }
    },
    methods: {
        submit () {
            /* eslint-disable no-useless-escape */
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            if (this.email !== '' && this.password !== '' && re.test(this.email) && this.password.length >= 6 && this.password.indexOf('|') === -1) {
                this.custom = this.email + '|' + this.password
            } else {
                window.alert('Invalid email or password (at least 6 characters without "|"s ).')
                this.email = ''
                this.password = ''
            }
        }
    }
}
</script>
<style scope>
    .ppButton {
        text-align: center;
    }
</style>