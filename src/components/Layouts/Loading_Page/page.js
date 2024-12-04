import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import style from './page.module.scss';

const Loader = (props) => {
  const [percentage, setPercentage] = useState(0);
  const loaderRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (percentage < 97) {
        setPercentage(
          (prevPercentage) => prevPercentage + Math.floor(Math.random() * 3) + 1
        );
      } else if (percentage >= 97 && percentage < 100) {
        setPercentage(100);
      }
    }, 40);

    if (percentage === 100) {
      clearInterval(interval);

      // Animation GSAP
      gsap.to(loaderRef.current, {
        y: '-100%',
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          props.setLoader(false);
        },
      });
    }

    return () => clearInterval(interval);
  }, [percentage, props]);

  return (
    <div className={style.loader_cont} ref={loaderRef}>
      <div className={style.loader_wrapper}>
        <p>Listen to music during</p>
        <h2>DES HEURES</h2>

        <div className={style.progress_container}>
          <div
            className={style.progress_bar}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <span>{percentage}%</span>
      </div>
    </div>
  );
};

export default Loader;