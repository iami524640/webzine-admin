
var express  = require('express');

//라우터에서 사용하고자 하는 모델 객체를 조회한다.
var User = require('../models/index.js').User;

//라우터 객체 생성
var router = express.Router();


//전체 사용자 정보 조회 OPEN API 기능 구현
//http://localhost/users URL호출시 작동
router.get('/',function(req,res,next){

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
    attributes:['email','nickname','entrytype','username','telephone','lastcontact'],
    where:{
      usertype:'u',
      userstate:'a'
    },
    order:[[ 'id','DESC' ]]
  })
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  });

});


//단일 데이터(사용자) 정보조회 샘플
//http://localhost/users/1 URL호출시 작동
router.get('/:id',(req,res,next) => {
  
  //시퀄라이즈 4.x대에 find 메소드가 5.x버전에서 없어지고
  //5.x버전에서는 findOne메소드를 사용합니다.
  //특정컬럼만 가지고오고싶으면 attributes속성에 컬럼을 지정합니다.
  //조건 필터링 조회하고자 하면 where속성에 여러개조합(And)으로 컬럼명과 값을 추가한다.
  User.findOne({
    attributes:['email','nickname','entrytype','username'],
    where:{
      id:req.params.id,
      usertype:'u'
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


//신규 사용자 등록처리 api
//브라우저에서 post방식으로 http://localhost/users 호출시 작동
router.post('/',function(req,res,next){

  User.create({
    email:req.body.email,
    userpwd:req.body.userpwd,
    nickname:req.body.nickname,
    entrytype:'local',
    snsid:req.body.snsid,
    username:req.body.username,
    telephone:req.body.telephone,
    photo:'sample.png',
    lastip:'127.0.0.1',
    usertype:'u',
    userstate:'a',
  })
  .then((result) =>{
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
router.patch('/:id',function(req,res,next){
  User.update(
    {
      nickname:req.body.nickname,
      username:req.body.username,
    },
    {
      where:{ id:req.params.id}
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
router.delete('/:id',(req,res,next) => {

  User.destroy({
    where:{id:req.params.id}
  })
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  })

});



//사용자 정보관리 전용 User라우터를 외부에 노출한다.
module.exports = router;
