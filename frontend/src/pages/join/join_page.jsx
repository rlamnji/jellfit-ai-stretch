import styles from '../../styles/pages/join_page.module.css';
import { Link } from "react-router-dom";
import InputField from '../../components/input_field';
import { useState } from 'react';

function JoinPage (){
    const [isValid, setIsValid] = useState(false);
    console.log("Join페이지 진입");
    return (
        <div className={styles.joinPage}>
            <h1>회원가입</h1>
            <div className="inputContainer">
                {/* 닉네임, 아이디 중복 X */}
            <InputField id='id' title='아이디' type='text' placeholder='아이디를 입력하세요'  />
            {/* 비밀번호랑 맞는지 확인 */}
            <InputField id='password' title='비밀번호' type='password' placeholder='비밀번호를 입력하세요'/>
            <InputField id='passwordConfirm' title='비밀번호 확인' type='password' placeholder='비밀번호 확인을 입력하세요'/>
            <InputField id='nickname' title='닉네임' type='text' placeholder='사용할 닉네임을 입력하세요'/>
            {/* 위 항목이 모두 입력되어야 버튼 활성화 */}
            <button>
                <Link to='/condition'>다음</Link>
            </button>
            </div>

        </div>
    );
}
export default JoinPage;