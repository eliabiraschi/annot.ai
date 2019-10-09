<template>
    <f7-page name="account">
        <f7-navbar title="Account" back-link="Back" sliding>
            <f7-nav-right>
                <f7-link icon="icon-bars" open-panel="right"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-block>
            <img src="https://secure.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=1024&d=mm&r=g" />
        </f7-block>
        <f7-list form v-if="user">
            <f7-list-item>
                <f7-label>Name</f7-label>
                <f7-input type="text" v-model="user.displayName"/>
            </f7-list-item>
            <f7-list-item>
                <f7-label>Email</f7-label>
                <f7-input type="text" v-model="user.email" disabled/>
            </f7-list-item>
            <f7-list-item>
                <f7-button raised fill color="green" @click="update()">Save changes</f7-button>
            </f7-list-item>
            <f7-list-item>
                <f7-button raised fill color="green" @click="resetPassword()">Reset Password by Email</f7-button>
            </f7-list-item>
            <f7-list-item>
                <f7-button raised fill color="blue" @click="importLocal()">Import notes saved locally</f7-button>
            </f7-list-item>
            <f7-list-item>
                <f7-button raised fill color="red" @click="deleteAccount()">Delete account</f7-button>
            </f7-list-item>
        </f7-list>
    </f7-page>
</template>
<script>
import firebase from '../bin/Cloud'
import { DB, RemoteDB } from '../bin/Storage'

export default {
    name: 'account',
    data () {
        return {
            'user': ''
        }
    },
    mounted () {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user
            } else {
                this.$router.load({url: '/'})
            }
        })
    },
    methods: {
        update () {
            firebase.auth().currentUser.updateProfile({
                displayName: this.user.displayName
            }).then(() => {
                this.$f7.addNotification({
                    message: `Profile updated`,
                    hold: 5000,
                    button: {
                        text: 'Ok',
                        color: 'green'
                    }
                })
            }, (error) => {
                console.error(error)
            })
        },
        resetPassword () {
            firebase.auth().sendPasswordResetEmail(this.user.email.trim())
            .then(() => {
                return firebase.auth().signOut()
            }).then(() => {
                this.$f7.addNotification({
                    message: `Reset email sent`,
                    hold: 5000,
                    button: {
                        text: 'Ok',
                        color: 'green'
                    }
                })
                this.$f7.closeModal()
            }).catch((error) => {
                window.alert(error.message)
                console.error(error)
            })
        },
        deleteAccount () {
            if (window.confirm('Are you sure?')) {
                firebase.auth().currentUser.delete()
                .then(() => {
                    this.$f7.addNotification({
                        message: `Account deleted`,
                        hold: 5000,
                        button: {
                            text: 'Ok',
                            color: 'green'
                        }
                    })
                    this.$f7.closeModal()
                }, (error) => {
                    window.alert(error.message)
                })
            }
        },
        importLocal () {
            const remoteDB = new RemoteDB(this.user.uid)
            DB.getAll({})
                .then(localNotes => localNotes.forEach(localNote => remoteDB.put(localNote)))
                .catch(error => console.error(error))
            this.$f7.addNotification({
                message: `Importing done`,
                hold: 5000,
                button: {
                    text: 'Ok',
                    color: 'green'
                }
            })
        }
    }
}
</script>
<style scoped>
    img {
        position: relative;
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 50%;
        left: 50%;
        transform: translateX(-50%);
    }
    .button-fill {
        width: 100%;
    }
</style>