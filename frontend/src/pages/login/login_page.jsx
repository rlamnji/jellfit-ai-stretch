import InputField from '../../components/input_field';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import imgLogo from '../../assets/images/etc/logo_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';
import SoundBtn from '../../components/buttons/sound_btn';

function LoginPage(){

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const isValid = id.length >= 1 && password.length >= 1;
    const navigate = useNavigate();

    const handleIdInput = (value) => {
        setId(value);
    };
    const handlePasswordInput = (value) => {
        setPassword(value);
    };

    const handleLogin = async (e) => {
        if (!isValid){
            e.preventDefault();
        }
        try {
            const formData = new URLSearchParams();
            formData.append("username", id);
            formData.append("password", password);

            const res = await fetch("http://localhost:8000/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            if (res.ok) { // 토큰 저장
                const { access_token } = await res.json();
                sessionStorage.setItem("accessToken", access_token);
                navigate("/home");
            } else if (res.status === 401) {
                alert("아이디 또는 비밀번호가 잘못되었습니다.");
            } else {
                alert("로그인 중 알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("로그인 오류:", error);
            alert("서버 연결에 실패했습니다.");
        }
    };

    return (
        <div className='w-full h-screen bg-space flex flex-col items-center'>
            <div class="w-full h-14 flex justify-end ">
                <SoundBtn />
            </div>
            <div className='header w-fit h-fit p-1'>
                <img className='w-[400px] h-[200px]' src={imgLogo} alt="타이틀 로고" />
            </div>

            <div className="relative w-[350px] h-auto">
                <form 
                    className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                    <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />
                    
                    {/* <div className='findContainer w-[280px] mt-2 flex justify-end'>
                        <Link className='text-input-text-color text-sm'>아이디 찾기</Link>
                        <div className='ml-1 mr-1 text-input-text-color text-sm'>|</div>
                        <Link className='text-input-text-color text-sm'>비밀번호 찾기</Link>
                    </div> */}

                    <div
                        className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                        ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}
                    >
                        <button
                            className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`}
                            type='submit'
                        >
                            로그인
                        </button>
                    </div>
                </form>

                <img className="absolute w-[600px] h-[200px] -left-60 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                <img className="absolute w-[500px] h-[200px] -right-80 -top-10" src={imgCloudRight} alt="오른쪽 구름" />
            </div>

            <div className='joinContainer flex m-4'>
                <div className='mr-3 font-medium text-[#BCBCBC] text-lg'>젤핏이 처음이라면?</div>
                <Link to="/join" className='font-semibold text-[#BCBCBC] text-lg underline'>회원가입</Link>
            </div>
        </div>
    );
}


export default LoginPage;