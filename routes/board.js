
var express  = require('express');


//게시판 테이블 관리 모델 추가
var Board = require('../models/index.js').Board;

//라우터 객체 생성npm
var router = express.Router();


//전체 게시판 데이터 정보조회
router.get('/',function(req,res,next){

  Board.findAll()
  .then((boards) =>{

      console.log("호출되고 있나용???");
      console.log(boards);

      //전체 게시판데이터 조회 JSON 으로 리턴
      res.json(boards);
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });

});


//단일 게시판 정보조회
//http://localhost/boards/1 포맷으로 호출이 발생하면
router.get('/:id',(req,res,next) => {

    Board.findOne({
    where:{
      id:req.params.id
    }

  })
  .then((result) => {
    //단일 게시판 정보를 json으로 변환 후 브라우저 전송
    res.json(result);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  })

});


//게시판 신규등록
router.post('/',function(req,res,next){

    Board.create({
        boardname:req.body.boardname,
        desc:req.body.desc,
        useyn:req.body.useyn,
        createduid:1
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

//게시판 정보수정
//수정할때는 put/patch 방식 두가지 지원
//put은 원본데이터의 전체 속성을 일괄 수정할때
//patch는 원본데이터의 일부 속성만 수정할때
router.patch('/:id',function(req,res,next){
    Board.update(
    {
      boardname:req.body.boardname,
      desc:req.body.desc,
      useyn:req.body.useyn,
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

//단일 게시판 정보 삭제
router.delete('/:id',(req,res,next) => {

  Board.destroy({
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



//사용자 정보관리 전용 Board라우터를 외부에 노출한다.
module.exports = router;
