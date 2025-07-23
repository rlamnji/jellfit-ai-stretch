import { useMemo } from "react";
import { motion } from "framer-motion";
import { getRandomFloat, getRandomItem, animationPresets } from "../../utils/animation_preset";

function AnimatedCharacter({ character, position }) {
  const {
    animation,
    scale,
    duration,
    delay
  } = useMemo(() => {
    const scale = getRandomFloat(0.9, 1.2);
    const duration = getRandomFloat(6, 10);
    const delay = getRandomFloat(0, 3);

    const allPresets = animationPresets(position);
    const presetKey = getRandomItem(Object.keys(allPresets));
    const animation = allPresets[presetKey].animate;

    return { animation, scale, duration, delay };
  }, [position]);

  return (
    <motion.img
      src={character.image_url}
      alt={character.name}
      className="w-[150px] h-[150px] object-contain absolute pointer-events-none"
      style={{
        transform: `scale(${scale})`,
      }}
      initial={{
        x: position.x,
        y: position.y,
        rotate: 0,
      }}
      animate={animation}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
        delay,
      }}
    />
  );
}

export default AnimatedCharacter;
