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
  parsearray; // 파싱한 값을 담은 어레이.

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
  }

  ngOnChanges() {
    // format payload for Angular UI Ace
    this.updatePayloadData(this.data['payload']); // 만약 변화가 일어났다면 - 변형된 데이터를 가져옵니다. 
    this.parsePayloadData();
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
    console.log(array[1]); // 테스트용 - 
    console.log(array[2]); // 테스트용 - 작성날짜 / 작성시스템 / 해쉬 추출
  
    /**
    * @returns {parsearray} : 값을 순서대로 담아서 리턴하는 배열
    * 0번 : 발급번호 / 첫 번째 어레이 / ([A-Z])\w+[-]\d
    * 1번 : 
    */

    this.parsearray[0] = array[0].match(/[A-Z])\w+[-]\d/g);

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