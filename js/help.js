const detailsElements = document.querySelectorAll('.faq details');

detailsElements.forEach((details) => {
  details.addEventListener('toggle', () => {
    if (details.open) {
      detailsElements.forEach((otherDetails) => {
        if (otherDetails !== details && otherDetails.open) {
          otherDetails.open = false;
        }
      });
    }
  });
});