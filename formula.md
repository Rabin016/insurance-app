# Formula for Fire Calculation

## Validation Input Values

- Limit Amount (min 1Lac BDT with no Max)
- Bank Tolerance (min 0% to 100%, Default 10%)
- After seletcting risk classification and occupancy type user can set premium rate manullay if user wants to. Otherwise it will be calculated based on risk classification and occupancy type.
- (total sum insured = limit amount + bank tolerance) User can provide sum insured in percentage instade of actual amount. If user provides sum insured in percentage then it will be calculated based on (limit amount + bank tolerance amount). And if its in percentage it has to be total of 100% total all premises sum insured.

### Example 1

- Limit (L) = 5,00,000 BDT
- Bank Tolerance (BT) = 10%
- Premises 1: Class I - Shop (PR1) = 40%
- Premises 2: Class II - Godown (PR2) = 60%
- RSD Coverage(RSD) = true (0.13%)
  > This are user input vaule. Now User Press Calculate Button. Then it will calculate the premium.

#### _Formula:_

Total Sum Insured (TSI) = Limit Amount (L) + Bank Tolerance Amount (BT) = 500000 + 10% = 550000 BDT

- Premises 1 Net Premium (P1NP) = (TSI \* PR1) \* (Premises 1 Rate + RSD Rate) = (550000 \* 40%) \* (0.15 + 0.13)% = 616
- Premises 2 Net Premium (P2NP) = (TSI \* PR2) \* (Premises 2 Rate + RSD Rate) = (550000 \* 60%) \* (0.13 + 0.13)% = 858
  > Class I Shop Rate = 0.15% & Class II Godown Rate = 0.13%

Total Net Premium (TNP) = P1NP + P2NP = 616 + 858 = 1474

Total Premium = Total Net Premium + VAT = 1474 + 15% = 1695.1

### Example 2

- Limit (L) = 5,00,000 BDT (optional becouse user define sum insured in amount not 0 - 100%)
- Bank Tolerance (BT) = 10% (optional becouse user define sum insured in amount not 0 - 100%)
- Premises 1: Class I - Shop (PR1) = 220000 BDT
- Premises 2: Class II - Godown (PR2) = 330000 BDT
- RSD Coverage(RSD) = true (0.13%)
  > This are user input vaule. Now User Press Calculate Button. Then it will calculate the premium.

#### _Formula:_

Total Sum Insured (TSI) = Limit Amount (L) + Bank Tolerance Amount (BT) = 500000 + 10% = 550000 BDT

- Premises 1 Net Premium (P1NP) = (TSI \* PR1) \* (Premises 1 Rate + RSD Rate) = (550000 \* 220000) \* (0.15 + 0.13)% = 616
- Premises 2 Net Premium (P2NP) = (TSI \* PR2) \* (Premises 2 Rate + RSD Rate) = (550000 \* 330000) \* (0.13 + 0.13)% = 858
  > Class I Shop Rate = 0.15% & Class II Godown Rate = 0.13%

Total Net Premium (TNP) = P1NP + P2NP = 616 + 858 = 1474

Total Premium = Total Net Premium + VAT = 1474 + 15% = 1695.1
