<template>
  <b-modal
    ref="FinneyWebConnect"
    :title="$t('accessWallet.finneyWebConnectTitle')"
    hide-footer
    class="bootstrap-modal modal-mew-connect"
    centered
  >
    <div class="modal-icon">
      <qrcode :value="QrCode" :options="{ size: 200 }" />
    </div>
    <div class="d-block content-container text-center">
      <h3 class="modal-large-text">
        {{ $t('accessWallet.finneyWebConnectDesc') }}
      </h3>
    </div>
    <customer-support />
  </b-modal>
</template>

<script>
import CustomerSupport from '@/components/CustomerSupport';
import { mapGetters } from 'vuex';
import { FinneyWallet } from '@/wallets';

export default {
  components: {
    'customer-support': CustomerSupport
  },
  data() {
    return {
      QrCode: ''
    };
  },
  computed: {
    ...mapGetters({
      path: 'path'
    })
  },
  mounted() {
    this.$refs.FinneyWebConnect.$on('show', () => {
      new FinneyWallet(this.codeDisplay)
        .then(wallet => {
          this.$store.dispatch('decryptWallet', [wallet]);
          this.$router.push({
            path: 'interface'
          });
        })
        .catch(_error => {
          // eslint-disable-next-line
          console.error(_error);
        });
    });
    this.$refs.FinneyWebConnect.$on('hidden', () => {
      // disconnect socket if not connected (the socket should disconnect eventually in all cases)
    });
  },
  methods: {
    codeDisplay(qrCode) {
      console.log(qrCode);
      this.QrCode = qrCode;
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'MewConnectModal-desktop.scss';
@import 'MewConnectModal-tablet.scss';
@import 'MewConnectModal-mobile.scss';
</style>
