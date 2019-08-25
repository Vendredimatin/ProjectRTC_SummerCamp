class ResultMessage {
    constructor(code, message){
        this.code = code;
        this.message = message;
    }

    static success(){
        return new ResultMessage(0,"SUCCESS");
    }

    static fail(){
        return new ResultMessage(1,"FAIL");
    }

    static fail_existed(){
        return new ResultMessage(2,"FAIL_EXISTED");
    }
}