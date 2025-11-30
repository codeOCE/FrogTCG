window.runPackAnimation = function (data = {}) {
  const pack = document.getElementById("pack-container");
  const flap = document.getElementById("pack-flap");
  const body = document.getElementById("pack-body");
  const bodyWrapper = document.getElementById("pack-body-wrapper");
  const packFoil = document.getElementById("pack-foil");

  const cardContainer = document.getElementById("card-container");
  const cardInner = document.getElementById("card-inner");
  const cardBack = document.getElementById("card-back");
  const cardFront = document.getElementById("card-front");

  const labelUser = document.getElementById("label-user");
  const labelCard = document.getElementById("label-card");
  const labelRarity = document.getElementById("label-rarity");

  const scene = document.getElementById("pack-scene");

  // -------------------------------
  // DATA PLUMBING
  // -------------------------------
  const userName = data?.user || data?.displayName || "";
  const cardName = data?.card?.name || "";
  const rarity = (data?.card?.rarity || data?.rarity || "common").toLowerCase();
  const cardImageUrl = data?.card?.imageUrl || "/placeholder-card.png";

  if (labelUser) labelUser.textContent = userName ? `${userName} pulled:` : "";
  if (labelCard) labelCard.textContent = cardName || "";
  if (labelRarity) labelRarity.textContent = rarity.toUpperCase();

  cardFront.src = cardImageUrl;

  cardContainer.classList.remove(
    "rarity-common",
    "rarity-uncommon",
    "rarity-rare",
    "rarity-epic",
    "rarity-legendary"
  );

  switch (rarity) {
    case "uncommon":
      cardContainer.classList.add("rarity-uncommon");
      break;
    case "rare":
      cardContainer.classList.add("rarity-rare");
      break;
    case "epic":
      cardContainer.classList.add("rarity-epic");
      break;
    case "legendary":
    case "mythic":
      cardContainer.classList.add("rarity-legendary");
      break;
    default:
      cardContainer.classList.add("rarity-common");
  }

  // -------------------------------
  // CREATE SPARKS / DEBRIS ONCE
  // -------------------------------
  let sparks = document.querySelectorAll(".spark");
  let debris = document.querySelectorAll(".debris");

  if (sparks.length === 0) {
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("div");
      s.classList.add("spark");
      scene.appendChild(s);
    }
    sparks = document.querySelectorAll(".spark");
  }

  if (debris.length === 0) {
    for (let i = 0; i < 28; i++) {
      const d = document.createElement("div");
      d.classList.add("debris");
      scene.appendChild(d);
    }
    debris = document.querySelectorAll(".debris");
  }

  // -------------------------------
  // HARD RESET
  // -------------------------------
  gsap.set(
    [pack, flap, body, cardContainer, cardInner, cardBack, cardFront, packFoil, scene],
    { clearProps: "all" }
  );

  if (bodyWrapper) bodyWrapper.classList.remove("torn");

  gsap.set(pack, {
    opacity: 1,
    scale: 0.8,
    rotationX: 25,
    rotationY: -35,
    rotationZ: 0,
    z: -600,
    x: 0,
    y: 0,
    transformOrigin: "center center"
  });

  gsap.set(flap, {
    opacity: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    clipPath: "inset(0 0 74% 0)",
    transformOrigin: "center bottom"
  });

  gsap.set(body, {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    clipPath: "inset(26% 0 0 0)",
    transformOrigin: "center top"
  });

  gsap.set(packFoil, {
    opacity: 0,
    x: -80,
    backgroundPosition: "0% 50%"
  });

  gsap.set(cardContainer, {
    opacity: 0,
    y: 40,
    z: -300,
    scale: 0.8
  });

  gsap.set(cardInner, {
    rotationY: 0,
    transformStyle: "preserve-3d"
  });

  gsap.set(cardBack, { rotationY: 0 });
  gsap.set(cardFront, { rotationY: 180 });

  gsap.set([...sparks, ...debris], {
    opacity: 0,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1
  });

  gsap.set(scene, {
    x: 0,
    y: 0
  });

  // -------------------------------
  // TIMELINE
  // -------------------------------
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // PACK ENTER (with 3D move-in)
  tl.to(pack, {
    duration: 1.2,
    z: -150,
    rotationX: 12,
    rotationY: -10,
    scale: 1,
    ease: "power3.out"
  });

  tl.to(
    pack,
    {
      duration: 1.0,
      z: 0,
      rotationY: 360,
      rotationX: 0,
      ease: "expo.out"
    },
    "-=0.7"
  );

  // FOIL SHIMMER DURING ENTRY
  tl.to(
    packFoil,
    {
      duration: 0.8,
      opacity: 0.7,
      x: 60,
      ease: "power2.out"
    },
    "-=0.9"
  );

  tl.to(
    packFoil,
    {
      duration: 0.5,
      opacity: 0,
      ease: "power1.out"
    },
    "-=0.2"
  );

  // SQUASH + BEND (dramatic)
  tl.to(pack, {
    duration: 0.1,
    scaleY: 1.12,
    scaleX: 0.94,
    rotationX: 30,
    ease: "power1.inOut"
  });

  // MICRO CAMERA SHAKE ON SCENE
  tl.to(
    scene,
    {
      duration: 0.1,
      x: "+=6",
      y: "+=4",
      yoyo: true,
      repeat: 3,
      ease: "power1.inOut"
    },
    "-=0.08"
  );

  // PACK LOCAL SHAKE
  tl.to(
    pack,
    {
      duration: 0.1,
      x: "+=8",
      y: "+=4",
      rotationZ: 2,
      yoyo: true,
      repeat: 3
    },
    "-=0.08"
  );

  // TEAR START (clean straight tear)
  tl.add("tearStart", "-=0.02");

  tl.to(
    flap,
    {
      duration: 0.18,
      rotationX: -70,
      y: -20,
      ease: "power1.out"
    },
    "tearStart"
  );

  tl.to(
    flap,
    {
      duration: 0.55,
      rotationX: -150,
      rotationZ: 20,
      y: -260,
      opacity: 0,
      ease: "power3.in"
    },
    "tearStart+=0.04"
  );

  // body flex (3D bend)
  tl.to(
    body,
    {
      duration: 0.18,
      scaleY: 0.9,
      rotationX: -10,
      ease: "power2.out"
    },
    "tearStart"
  );

  // show torn paper edge
  tl.call(
    () => {
      if (bodyWrapper) bodyWrapper.classList.add("torn");
    },
    null,
    "tearStart+=0.08"
  );

  // SPARKS + DEBRIS ONLY (no flash)
  sparks.forEach((spark) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 160 + Math.random() * 120;

    tl.to(
      spark,
      {
        duration: 0.08,
        opacity: 1
      },
      "tearStart"
    );

    tl.to(
      spark,
      {
        duration: 0.7 + Math.random() * 0.3,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        scale: 0.23,
        opacity: 0,
        ease: "power3.out"
      },
      "tearStart+=0.02"
    );
  });

  debris.forEach((d) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 130 + Math.random() * 120;

    tl.to(
      d,
      {
        duration: 0.08,
        opacity: 1,
        scale: 0.7 + Math.random()
      },
      "tearStart"
    );

    tl.to(
      d,
      {
        duration: 0.8,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        rotation: -50 + Math.random() * 100,
        opacity: 0,
        ease: "power2.out"
      },
      "tearStart+=0.04"
    );
  });

  // BODY FALLS AWAY
  tl.to(
    body,
    {
      duration: 0.7,
      opacity: 0,
      scale: 0.8,
      rotationX: 10,
      ease: "power2.inOut"
    },
    "tearStart+=0.12"
  );

  // CARD RISE + FLIP
  tl.add("cardRise", "tearStart+=0.1");

  tl.to(
    cardContainer,
    {
      duration: 0.6,
      opacity: 1,
      y: -60,
      z: 80,
      scale: 1,
      ease: "back.out(1.6)"
    },
    "cardRise"
  );

  tl.to(
    cardInner,
    {
      duration: 0.6,
      rotationY: 180,
      ease: "power3.inOut"
    },
    "cardRise+=0.28"
  );

  // HOLD, THEN FADE
  tl.to(cardContainer, {
    duration: 0.6,
    opacity: 0,
    y: -20,
    scale: 0.9,
    delay: 3,
    ease: "power2.in"
  });

  // reset camera shake
  tl.to(
    scene,
    {
      duration: 0.2,
      x: 0,
      y: 0,
      ease: "power1.inOut"
    },
    "-=0.4"
  );

  return tl;
};
