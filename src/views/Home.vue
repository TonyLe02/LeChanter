<template>
  <title-base title="Home" boxIcon="bx bxs-home" />

  <div class="mt-4">
    <label for="token" class="text-lg text-white mb-2">Message to Electron:</label>
    <div class="relative">
      <textarea v-model="message" id="token"
        class="w-[650px] bg-[#302b3b] border border-gray-600 rounded-lg px-3 py-2 text-white" rows="2"
        placeholder="Enter your message..."></textarea>
    </div>
  </div>

  <a @click="sendMessage"
    class="border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors duration-250 rounded-none text-white mt-2 px-7 py-2.5 cursor-pointer select-none">
    <i class="bx bx-check mr-2 mt-10"></i> Send Message
  </a>
</template>

<script>
import { toast } from 'vue3-toastify';
import TitleBase from '../components/titles/TitleBase.vue';

export default {
  name: 'Home',
  components: {
    TitleBase,
  },
  data() {
    return {
      message: '',
    };
  },
  methods: {
    sendMessage() {
      if (this.message.trim()) {
        
        window.electronAPI.messageToElectron(this.message); // window.electronAPI is defined in preload.js

        toast.info("Message was successfully sent!", {
          theme: "dark",
          autoClose: 2000,
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.warn("Please enter a message before sending.", {
          theme: "dark",
          autoClose: 2000,
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    },
  },
};
</script>