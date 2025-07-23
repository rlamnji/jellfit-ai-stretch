// 로그인 폼 컴포넌트
// 컴포넌트
import InputField from "./input_field";

// 훅 (커스텀 훅)
import { useLoginForm } from "../hooks/use_login_form";


function LoginForm(){
    {/* 커스텀 훅 */}
    const { isValid, handleIdInput, handlePasswordInput, handleLogin} = useLoginForm();

    return(
        <form className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
        >
                {/* ID, PWD 입력 */}
                <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />

                {/* 로그인 버튼 */}    
                <div className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                                    ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}>
                    <button className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`} type='submit'>
                        로그인
                    </button>
                </div>
        </form>
    );
}

export default LoginForm