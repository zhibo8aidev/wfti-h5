const pressableNodes = document.querySelectorAll(
  ".cta-btn, .ghost-btn, .option-card, .icon-btn, .switch-btn"
);

pressableNodes.forEach((node) => {
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

const deviceButtons = document.querySelectorAll(".switch-btn");
deviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.deviceTarget;
    document.body.dataset.device = target;

    deviceButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
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

document.querySelectorAll(".status-orb, .poster-figure").forEach((node, index) => {
  node.animate(
    [
      { transform: "translateY(0px)" },
      { transform: "translateY(-6px)" },
      { transform: "translateY(0px)" }
    ],
    {
      duration: 3800 + index * 200,
      iterations: Infinity,
      easing: "ease-in-out"
    }
  );
});
