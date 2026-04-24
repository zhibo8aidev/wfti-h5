document.querySelectorAll(".cta-btn, .ghost-btn, .option-card, .icon-btn").forEach((node) => {
  node.addEventListener("click", () => {
    node.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(0.985)", filter: "brightness(1.04)" },
        { transform: "scale(1)", filter: "brightness(1)" }
      ],
      {
        duration: 180,
        easing: "ease-out"
      }
    );
  });
});

document.querySelectorAll(".scan-ring").forEach((ring, index) => {
  ring.animate(
    [
      { transform: "translate(-50%, -50%) rotate(0deg)" },
      { transform: "translate(-50%, -50%) rotate(360deg)" }
    ],
    {
      duration: 4800 + index * 1200,
      iterations: Infinity,
      easing: "linear"
    }
  );
});

const heroSphere = document.querySelector(".persona-core");
if (heroSphere) {
  heroSphere.animate(
    [
      { transform: "translateX(-50%) translateY(0px)" },
      { transform: "translateX(-50%) translateY(-8px)" },
      { transform: "translateX(-50%) translateY(0px)" }
    ],
    {
      duration: 4200,
      iterations: Infinity,
      easing: "ease-in-out"
    }
  );
}

