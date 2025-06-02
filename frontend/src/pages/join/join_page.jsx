import InputField from '../../components/input_field';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import imgJoinLogo from '../../assets/images/etc/join_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';
import TopBar from '../../components/top_bar';
import background from '../../assets/images/etc/basic_background2.png';



function JoinPage (){
    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const isValid = id.length >= 1 && password.length >= 1 && passwordConfirm === password && nickname.length >= 1;

    const handleIdInput = (value) =>{
        setId(value);
    };
    const handlePasswordInput = (value) =>{
        setPassword(value);
    };
    const handlePasswordConfirmInput = (value) =>{
        setPasswordConfirm(value);
    };
    const handleNicknameInput = (value) =>{
        setNickname(value);
    }

    const sendUserJoinData = async (id, password, nickname) =>{
        const res = await fetch("http://localhost:8000/auth/join", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                id : id,
                password : password,
                nickname : nickname
            })
        });
        if(res.ok){
            return res;
        } else {
            console.log(res.status);
            alert("회원가입에 실패했습니다."); //에러 처리 나중에 수정.
            navigate("/login");
            return null;
        }
    }
    const handleJoin = async (e) => {
        if (!isValid){
            e.preventDefault();
        }
        const res = await sendUserJoinData(id, password, nickname);
        const { msg, userId, access_token } = await res.json();
        console.log(`${msg} userId : ${userId}`);
        console.log("access_token:", access_token);
        sessionStorage.setItem("accessToken", access_token); //토큰 저장.
        navigate(`/condition/${userId}`); //캘리브레이션 페이지로 이동.
    };

    return (
        <div>
            <img
            src={background}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
            />
            <div className='w-full h-screen flex flex-col items-center'>
                <TopBar />
                <div className='header w-fit h-fit p-1'>
                    <img className='w-[400px] h-[160px]' src={imgJoinLogo} alt="회원가입 타이틀" />
                </div>

                <div className="relative w-[350px] h-auto">
                    <form 
                        className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleJoin();
                        }}
                    >
                        <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                        <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />
                        <InputField id='passwordConfirm' title='비밀번호 확인' type='password' placeholder='' onTextChange={handlePasswordConfirmInput} />
                        <InputField id='nickname' title='닉네임' type='text' placeholder='' onTextChange={handleNicknameInput} />
                        
                        <div
                            className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                            ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}
                        >
                            <button
                                className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`}
                                type='submit'
                            >
                                계정 생성하기
                            </button>
                        </div>
                    </form>

                    <img className="absolute w-[600px] h-[200px] -left-60 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                    <img className="absolute w-[500px] h-[200px] -right-80 -top-10" src={imgCloudRight} alt="오른쪽 구름" />
                </div>
            </div>
        </div>
    );
}
export default JoinPage;

