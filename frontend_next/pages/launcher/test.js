const clickOutsideHandler = (event, el, binding) => {
  if (!(el === event.target || el.contains(event.target))) { binding.value(event); }
};

export const clickOutside = {
  beforeMount(el, binding) {
   
    document.addEventListener('click', (e) => clickOutsideHandler(e, el, binding));
  },

  unmounted(el) { document.removeEventListener('click', clickOutsideHandler) }

};