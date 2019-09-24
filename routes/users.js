
var express = require('express');

//암호화 모듈 추가
const bcrpyt =require('bcrypt');

//jwt 모듈 추가
const jwt = require('jsonwebtoken');

//JWT 토큰 유효성 검사 미들웨어 기능 추가
const { verifyToken } = require('./middlewares'); 


//라우터에서 사용하고자 하는 모델 객체를 조회한다.
var User = require('../models/index.js').User;

//라우터 객체 생성
var router = express.Router();


//전체 사용자 정보 조회 OPEN API 기능 구현
//http://localhost/users URL호출시 작동
router.get('/', function (req, res, next) {

  //별다른 조건없이 전체 테이블 데이터 조회
  //User모델을 이용해 전체 사용자 정보를 조회하고
  //JSON 포맷으로 변환 후 브라우저에 전달한다.
  //하기 시퀄라이즈 쿼리는 시퀄라이즈ORM에 의해 select * from users 쿼리로 변환되어 
  //MYSQL 서버에 해당 DB로 전달되어 실행된후 조회결과값이 백엔드로 전달된다.
  // User.findAll()
  // .then((users) =>{
  //     res.json(users);
  // })
  // .catch((err) => {
  //   //console.log(err);
  //   console.error(err);
  //   next(err);
  // });


  //조회 조건 추가 및 출력 컬럼 지정하여 특정컬럼만 조회되게함
  //시퀄라이즈 쿼리구문으로 필터링 과 정렬기능 구현예시
  //하기 시퀄라이즈 쿼리는 시퀄라이즈ORM에 의해 
  //select email,nickname,entrytype,username,telephone,lastcontact from users 
  // where usertype='u' and userstate='a' order by id desc  쿼리로 변환되어 
  //MYSQL 서버에 해당 DB로 전달되어 실행된후 조회결과값이 백엔드로 전달된다.
  User.findAll({
    attributes: ['email', 'nickname', 'entrytype', 'username', 'telephone', 'lastcontact'],
    where: {
      usertype: 'u',
      userstate: 'a'
    },
    order: [['id', 'DESC']]
  })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

});


//회원가입 처리 메소드
router.post('/regist', async (req, res) => {

  try {

    //Step1: 동일 이메일 계정 존재여부 체크

    //동일 이메일주소 사용자 정보조회
    const existUser = await User.findOne({
      where: { email: req.body.email }
    });

    //동일 사용자 주소 존재시 체크
    if (existUser) {
      console.log("이미 가입된 메일주소입니다.");

      //서버에서 에러가 난것처럼 결과메시지를 클라이언트에 전송
      return res.json({
        code: 500,
        message: '이미 가입된 메일주소입니다.'
      });
    } 
    else 
    {

      //클라이언트에서 보내준 데이터로 회원등록처리

      //Step1: 사용자 암호 단방향 암호화 문자열 생성
      const hash = await bcrpyt.hash(req.body.userpwd,12);

      
      //Step2:신규회원정보 등록처리
      const newUser = await User.create({
        email: req.body.email,
        userpwd: hash,
        nickname: req.body.username,
        entrytype: 'local',
        snsid: '',
        username: req.body.username,
        telephone: '',
        photo: 'sample.png',
        lastip: '127.0.0.1',
        usertype: 'u',
        userstate: 'a',
      });

      return res.json({ code: 200, result: newUser });

    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ code: 500, message: '서버에러발생' });

  }





});



//회원 로그인처리 : 일반형
router.post('/login', async (req, res) => {

  try {

    //동일 이메일주소 사용자 정보조회
    const existUser = await User.findOne({
      where: { email: req.body.email }
    });


    //동일 사용자 주소 존재시 로그인 처리
    if (existUser) {

      //Step1: 사용자 입력 암호와 DB상에 암호화된 암호를 비교한다.
       const result = await bcrpyt.compare(req.body.userpwd,existUser.userpwd);
      
      //Step2: 암호 비교 결과에 따른 메시지 분기처리
      if(result){
        //암호가 같은경우
        return res.json({ code:200,result:existUser });
      }else{
        //암호가 틀린경우 에러 메시지 발생 전달
        return res.json({ code: 500, message: '암호가 일치하지 않습니다.' });
      }
    } 
    else 
    {
      //동일 사용자 정보가 존재하지 않은경우
      //로그인 계정이 없음 에러 발생 메시지 처리
      return res.json({ code: 500, message: '동일한 메일계정이 존재하지 않습니다.' });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ code: 500, message: '서버에러발생' });

  }

});

//회원 로그인처리 : 토큰형 
router.post('/tlogin', async (req, res) => {

  try {

    //동일 이메일주소 사용자 정보조회
    const existUser = await User.findOne({
      where: { email: req.body.email }
    });


    //동일 사용자 주소 존재시 로그인 처리
    if (existUser) {

      //Step1: 사용자 입력 암호와 DB상에 암호화된 암호를 비교한다.
       const result = await bcrpyt.compare(req.body.userpwd,existUser.userpwd);
      
      //Step2: 암호 비교 결과에 따른 메시지 분기처리

      if(result){
        //암호가 같은경우
        //return res.json({ code:200,result:existUser });

        //JWT인증 토큰을 생성 후 브라우저에 전달
        //jwt.sign('사용자정보저장 페이로드','jwt인증용키값','기타설정(파기일자)')
        const token = jwt.sign({
          id:existUser.id,
          email:existUser.email,
          username:existUser.username
        },process.env.JWT_SECRET,{
          expiresIn:'1m',//1분
          issuer:'webzineadmin'
        });

        return res.json({
          code:200,
          result:token
        });

      }else{
        //암호가 틀린경우 에러 메시지 발생 전달
        return res.json({ code: 500, message: '암호가 일치하지 않습니다.' });
      }
    } 
    else 
    {
      //동일 사용자 정보가 존재하지 않은경우
      //로그인 계정이 없음 에러 발생 메시지 처리
      return res.json({ code: 500, message: '동일한 메일계정이 존재하지 않습니다.' });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ code: 500, message: '서버에러발생' });

  }

});


//회원 프로파일 정보조회
//회원 프로파일 openapi가 호출되면 미들웨어모듈의 
//토큰 유효성 검사 공통모듈을 먼저수행하고 내부 데이터조회
//기능이 수행된다.
router.get('/profile',verifyToken, async(req, res) =>{

  //미들웨어 정상 토큰 유효성 검사후 req.decoded에 저장된
  //사용자 정보를 tokeUserData 변수에 저장한다.
  //var tokeUserData = req.decoded;
  var loginUserEmail = req.decoded.email;
  var loginUserID = req.decoded.id;
  var loginUserName = req.decoded.username;

  try{
    const myData = await User.findOne({
      where:{email:loginUserEmail}
    });
  
    return res.json({
      code:200,
      result:myData
    })

  }catch(err){
    return res.status(500).json({
      code:500,
      message:'서버에러발생'
    });

  }





});





//신규 사용자 등록처리 api
//브라우저에서 post방식으로 http://localhost/users 호출시 작동
router.post('/', function (req, res, next) {

  User.create({
    email: req.body.email,
    userpwd: req.body.userpwd,
    nickname: req.body.nickname,
    entrytype: 'local',
    snsid: req.body.snsid,
    username: req.body.username,
    telephone: req.body.telephone,
    photo: 'sample.png',
    lastip: '127.0.0.1',
    usertype: 'u',
    userstate: 'a',
  })
    .then((result) => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    })

});



//사용자 정보 수정처리 OPEN API
//하기 시퀄라이즈 쿼리는 
// update users set nickname='value1',username='value2' where id=1 
//SQL 쿼리로 변환되어 백엔드 노드서버에서 MYSQLDB로 전달되어 DB에서 실행후 결과물이
//노드 서버로 넘어온다.
router.patch('/:id', function (req, res, next) {
  User.update(
    {
      nickname: req.body.nickname,
      username: req.body.username,
    },
    {
      where: { id: req.params.id }
    }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });

});


//사용자 정보 삭제하기
//브라우저가 요청시 delete 방식으로 http://localhost/users/1 URL포맷으로 호출시
//실행됩니다.
// delete from users where id=1 쿼리로 변환되어 DB에 전달되어 실행됩니다.
router.delete('/:id', (req, res, next) => {

  User.destroy({
    where: { id: req.params.id }
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    })

});



//단일 데이터(사용자) 정보조회 샘플
//http://localhost/users/1 URL호출시 작동
router.get('/:id', (req, res, next) => {

  //시퀄라이즈 4.x대에 find 메소드가 5.x버전에서 없어지고
  //5.x버전에서는 findOne메소드를 사용합니다.
  //특정컬럼만 가지고오고싶으면 attributes속성에 컬럼을 지정합니다.
  //조건 필터링 조회하고자 하면 where속성에 여러개조합(And)으로 컬럼명과 값을 추가한다.
  User.findOne({
    attributes: ['email', 'nickname', 'entrytype', 'username'],
    where: {
      id: req.params.id,
      usertype: 'u'
    }
  })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    })

});



//사용자 정보관리 전용 User라우터를 외부에 노출한다.
module.exports = router;
