<template>
    <f7-login-screen id="login-screen">
      <f7-view>
        <f7-pages>
          <f7-page login-screen>
            <f7-login-screen-title>Login</f7-login-screen-title>
            <f7-list form>
              <f7-list-item>
                <f7-label>Email</f7-label>
                <f7-input name="email" placeholder="email" v-model="email" type="text"></f7-input>
              </f7-list-item>
              <f7-list-item>
                <f7-label>Password</f7-label>
                <f7-input name="password" type="password" v-model="password" placeholder="Password"></f7-input>
              </f7-list-item>
              <f7-list-item>
                <f7-button fill @click="submit()">Log in</f7-button>
              </f7-list-item>
              <f7-list-item>
                <f7-button raised fill color="orange" @click="forgot()">Forgot password</f7-button>
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
import firebase from '../bin/Cloud'

export default {
    name: 'login-screen',
    data () {
        return {
            'email': '',
            'password': ''
        }
    },
    methods: {
        submit () {
            firebase.auth().signInWithEmailAndPassword(this.email.trim(), this.password)
                .then(() => {
                    this.$f7.closeModal()
                })
                .catch((error) => {
                    window.alert(error.message)
                })
        },
        forgot () {
            if (this.email !== '') {
                firebase.auth().sendPasswordResetEmail(this.email.trim())
                .then(() => {
                    this.$f7.addNotification({
                        message: `Reset email sent to the provided email address`,
                        hold: 5000,
                        button: {
                            text: 'Ok',
                            color: 'orange'
                        }
                    })
                    this.$f7.closeModal()
                }, (error) => {
                    window.alert(error.message)
                })
            } else {
                window.alert('Please provide an email address where we can send the recovery email')
            }
        }
    }
}
</script>