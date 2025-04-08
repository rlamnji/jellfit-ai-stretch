// 도감 페이지
import { useNavigate } from 'react-router-dom';
import collectBox from '../../assets/images/icons/home/collect_box.png';
import collectBook from '../../assets/images/icons/home/collect_book.png';
import collectCancel from '../../assets/images/icons/home/collect_cancel.png';
import styles from '../../styles/pages/collect_page.module.css';

function CollectPage() {
   const navigate = useNavigate();

    return (
      <div className={styles.collectPage}>
         <div className={styles.collectBook}>
            <img src={collectBook} />
            <img src={collectCancel} className={styles.collectCancel} onClick={()=>navigate('/home')}/>
            <div className={styles.momdelImg}>여기에 해파리 이미지</div>
            <div className={styles.modelName}>한 입 먹힌 해파리(DB)</div>
            <div className={styles.modelDescription}>DB에 있는 설명 ! 너무 길면 스크롤 되게 했음!!</div>
         
            {/* 화면 테스트를 위해 임시로 40개 생성 */}
            <div className={styles.collectBox}> 
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
               <img src={collectBox}/>
            </div>

         </div>
      </div>
    );
  }
  
  export default CollectPage;
  