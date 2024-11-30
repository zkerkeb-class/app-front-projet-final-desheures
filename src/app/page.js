import Image from 'next/image';
import style from 'styles/page.module.scss';

import Background_Image from 'images/login/one_piece.jpg';
import Logo_Crew from 'images/logo/logo_crew.png';

const Home = () => {
  return (
    <div className={style.container}>
      <div className={style.image_wrapper}>
        <Image
          src={Background_Image}
          alt="One Piece Background"
          layout="fill"
          objectFit="cover"
          className={style.image}
        />
        <div className={style.logo_wrapper}>
          <Image
            src={Logo_Crew}
            alt="Logo Crew"
            width={100}
            height={100}
            className={style.logo}
          />
        </div>
        <div className={style.text_wrapper}>
          <h1 className={style.title}>Crew</h1>
          <h2 className={style.subtitle}>Customer Relationship Management</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;
