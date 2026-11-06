import assert from 'node:assert/strict'
import test from 'node:test'
import { minorToMoneyInput, parseMoneyToMinor } from '../../platform/components/MutationForm'

test('operator money input is exact: dollars in, minor-unit string out', () => {
  assert.equal(parseMoneyToMinor('12.00'), '1200')
  assert.equal(parseMoneyToMinor('12'), '1200')
  assert.equal(parseMoneyToMinor('12.5'), '1250')
  assert.equal(parseMoneyToMinor('$1,000.01'), '100001')
  assert.equal(parseMoneyToMinor('0'), '0')
  assert.equal(parseMoneyToMinor('90071992547409.93'), '9007199254740993')
  assert.equal(parseMoneyToMinor('12.345'), null)
  assert.equal(parseMoneyToMinor('-5'), null)
  assert.equal(parseMoneyToMinor('-5.25', 2, true), '-525')
  assert.equal(parseMoneyToMinor('-0', 2, true), '0')
  assert.equal(parseMoneyToMinor('1e3'), null)
  assert.equal(parseMoneyToMinor('7', 0), '7')
})

test('minor-unit defaults display as dollars', () => {
  assert.equal(minorToMoneyInput('1200'), '12.00')
  assert.equal(minorToMoneyInput(5), '0.05')
  assert.equal(minorToMoneyInput('-525'), '-5.25')
  assert.equal(minorToMoneyInput(7, 0), '7')
})
