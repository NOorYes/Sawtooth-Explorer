/**
 * Copyright 2017 PokitDok, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

import { Component, Input, OnInit, OnChanges} from '@angular/core';
import {MatTableDataSource} from '@angular/material'; // 테이블
import { Base64DecodePipe } from '../../pipes/base64-decode/base64-decode.pipe'; // 디코더 파이프 
import { UIAceDataTransformPipe } from
  '../../pipes/ui-ace-data-transform/ui-ace-data-transform.pipe'; // ace 데이터 형태로 변환하는 파이프
/**
 * A component that formats all the data associated with a transaction for
 * display.
 */
@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: [
    './transaction.component.scss',
    '../../../styles/shared/_explorer-detail.scss'
  ],
  providers: [Base64DecodePipe, UIAceDataTransformPipe]
})
export class TransactionComponent implements OnInit, OnChanges {

  // data representing the transaction
  @Input() data = {};

  // data stringified for Angular UI Ace to display
  // 데이터를 스트링화함 
  payloadJSON = '{}';
  testdata; // 테스트용, 이걸로 파싱할 예정. 
  parsearray : string[] = []; // 파싱한 값을 담은 어레이.
  ELEMENT_DATA: Element[];
  
  displayedColumns = ['position', 'name'];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  // set default UI Ace display to show as plain text (no syntax highlighting)
  // 에이스모드 : 텍스트, 코드가 아닌 일반 구문이라는 뜻. 
  aceMode = 'text';

  /**
   * @param uiAceDataTransformPipe {UIAceDataTransformPipe} - used to transform
   * data into a format displayable by Angular UI Ace
   * Angular UI Ace로 표시 할 수있는 형식의 데이터로 변환하는 데 사용됨.
   */
  constructor(private uiAceDataTransformPipe: UIAceDataTransformPipe) {}

  // ngOnInit needed in addition to ngOnChanges because when this view is
  // ngOnChanges 이외에 ngOnInit이 필요합니다. 왜냐하면이 뷰가
  // dynamically loaded as a component, ngOnInit fires, but ngOnChanges doesn't.
  // 동적 로드될때 ngOnInit은 발생하지만 ngOnChanges는 그렇지 않기 때문입니다. 
  ngOnInit() {
    // format payload for Angular UI Ace
    // 앵귤러 UI 에이스의 형식 페이로드
    this.updatePayloadData(this.data['payload']);
    this.parsePayloadData();
    this.insertTable(this.ELEMENT_DATA); // 테이블에 값 넣는용
  }

  ngOnChanges() {
    // format payload for Angular UI Ace
    this.updatePayloadData(this.data['payload']); // 만약 변화가 일어났다면 - 변형된 데이터를 가져옵니다. 
    this.parsePayloadData();
    this.insertTable(this.ELEMENT_DATA); // 테이블에 값 넣는용
  }

  /**
   * Updates transaction payload so it can be displayed in UI Ace
   * 트랜잭션 페이로드를 에이스에 표시할 수 있도록 업데이트합니다. 
   * @param payloadData - data representing the payload within a transaction : 트랜잭션 내의 페이로드를 나타내는 데이터
   */
  updatePayloadData(payloadData: any): void {
    // format payload for Angular UI Ace
    let formatRes = this.getFormatData(payloadData);
    this.testdata = JSON.stringify(formatRes.data, null, 2); // 테스트용, 이 값은 \n이 존재함.
    this.payloadJSON = formatRes.data;
    this.aceMode = formatRes.aceDisplayMode;
  }

  parsePayloadData(): void {
    let array = this.testdata.split('\\n');
    console.log(array[0]); // 테스트용 - 발급번호를 추출해야됨. 발급사유도 있는데 그건 스킵.
    console.log(array[1]); // 테스트용 추출값 - 발급일시 / 공급회사 코드 / 공급회사명 / 사업자등록번호
    // 대표자명 / 공급회사 전화번호 / 공급회사 주소 / 작성자 이름 / 작성자 직위 / 작성자 회사명 / 회사의 주소
    console.log(array[2]); // 테스트용 - 작성날짜 / 작성시스템 / 해쉬 추출
  
    /**
    * @returns {parsearray} : 값을 순서대로 담아서 리턴하는 배열
    * 0번 : 발급번호 / 첫 번째 어레이 / ([A-Z])\w+[-]\d
    * 1번 : 발급일시
    * 2번 : 발급사유 
    * 3번 : ..
    */

    this.parsearray[0] = array[0].match(/([A-Z])\w+[-]\d/g); // 발급번호
    this.parsearray[1] = array[1].match(/(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1]):/g); // 발급일시
    //this.parsearray[1] =  this.parsearray[1].slice(0,-1);
    console.log(this.parsearray[1]);
    this.parsearray[2] = array[1].match(/[A-Z]{2}-[0-9]{3}-[0-9]{2}-[A-Z]{2}/g); // 공급회사 코드
    this.parsearray[3] = array[1].match(/[가-힣]+J/g); // 공급회사명
    //this.parsearray[3] =  this.parsearray[3].slice(0,-1); 
    this.parsearray[4] = array[1].match(/\d{3}-\d{2}-\d{5}/g); // 사업자 등록번호
    this.parsearray[5] = array[1].match(/[가-힣]+Z/g); // 대표자명
    //this.parsearray[5] =  this.parsearray[5].slice(0,-1);
    this.parsearray[6] = array[1].match(/\d{3}-\d{3,4}-\d{4}/g); // 공급회사 전화번호
    this.parsearray[7] = array[1].match(/((([가-힣]+(시|도)|[서울]|[인천]|[대구]|[광주]|[부산]|[울산])( |)[가-힣]+(시|군|구)( |))[가-힣]+([가-힣]|(\d{1,5}(~|-)\d{1,5})|\d{1,5})+(로|길)( |)(\d)+)Â/g); // 공급회사 주소
    //this.parsearray[7] =  this.parsearray[7].slice(0,-1);
    
    this.parsearray[8] = array[1].match(/[가-힣]+Ê/g); // 작성자 이름
    this.parsearray[9] = array[1].match(/[가-힣]+Ò/g); // 작성자 직위
    this.parsearray[10] = array[1].match(/[가-힣]+Ú /g); // 작성자 회사명
    //this.parsearray[8] =  this.parsearray[8].slice(0,-1);
    //this.parsearray[9] =  this.parsearray[9].slice(0,-1);
    //this.parsearray[10] =  this.parsearray[10].slice(0,-1);
    this.parsearray[11] = array[1].match(/((([가-힣]+(시|도)|[서울]|[인천]|[대구]|[광주]|[부산]|[울산])( |)[가-힣]+(시|군|구)( |))[가-힣]+([가-힣]|(\d{1,5}(~|-)\d{1,5})|\d{1,5})+(로|길)( |)(\d)+)â/g); // 작성자 회사의 주소
    //this.parsearray[11] =  this.parsearray[11].slice(0,-1);

    this.parsearray[12] = array[2].match(/(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])ú/g); // 작성날짜 
    //this.parsearray[12] =  this.parsearray[12].slice(0,-1);
    this.parsearray[13] = array[2].match(/kFop/g); // 작성시스템
    this.parsearray[14] = array[2].match(/[A-Fa-f0-9]{32}/g); // 해쉬 

  }

  insertTable(ELEMENT_DATA: Element[]): void {
    ELEMENT_DATA =[
    {position: '발급번호', name: this.parsearray[0]},
    {position: '발급일시', name: this.parsearray[1]},
    {position: '공급회사 코드', name: this.parsearray[2]},
    {position: '공급회사명', name: this.parsearray[3]},
    {position: '사업자 등록번호', name: this.parsearray[4]},
    {position: '대표자명', name: this.parsearray[5]},
    {position: '공급회사 전화번호', name: this.parsearray[6]},
    {position: '공급회사 주소', name: this.parsearray[7]},
    {position: '작성자 이름', name: this.parsearray[8]},
    {position: '작성자 직위', name: this.parsearray[9]},
    {position: '작성자 회사명', name: this.parsearray[10]},
    {position: '작성자 회사 주소', name: this.parsearray[11]}
    ]
  }
  

  /**
   * Gets formatting information needed for a transaction payload to be, 트랜잭션 페이로드에 필요한 형식 정보를 가져옵니다.
   * displayed in string form. 문자열 형식으로 표시.
   * @param payloadData - data representing the payload within a transaction, 트랜잭션 내의 페이로드를 나타내는 데이터
   * @returns {object} formatted transaction payload data, 오브젝트 형식의 트랜잭션 페이로드 데이터
   */
  getFormatData(payloadData: any): any {
    let formatResult = this.uiAceDataTransformPipe.parseForUIAce(payloadData);
    return formatResult;
  }
}

export class ExpansionOverviewExample {
  panelOpenState: boolean = false;
}

export interface Element {
  name: string;
  position: string;
}

/*
const ELEMENT_DATA: Element[] = [
  {position: '발급번호', name: this.parsearray[0]},
  {position: '발급일시', name: this.parsearray[1]},
  {position: '공급회사 코드', name: this.parsearray[2]},
  {position: '공급회사명', name: this.parsearray[3]},
  {position: '사업자 등록번호', name: this.parsearray[4]},
  {position: '대표자명', name: this.parsearray[5]},
  {position: '공급회사 전화번호', name: this.parsearray[6]},
  {position: '공급회사 주소', name: this.parsearray[7]},
  {position: '작성자 이름', name: this.parsearray[8]},
  {position: '작성자 직위', name: this.parsearray[9]},
  {position: '작성자 회사명', name: this.parsearray[10]},
  {position: '작성자 회사 주소', name: this.parsearray[11]}
];
*/