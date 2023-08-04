# file này giúp chuyển file dữ liệu csv thành prompy và complettion tương ứng 

import pandas as pd
import json

# đọc file csv
df = pd.read_csv('hcm-doanh-nghiep.csv')

# tạo list chứa các dictionary
jsonl_data = []

# vòng lặp qua từng hàng dữ liệu và tạo prompt và completion tương ứng
for index, row in df.iterrows():
    prompt = f"Thông tin liên hệ của công ty {row['TÊN CÔNG TY']} là gì?"
    completion = f"Địa chỉ: {row['ĐỊA CHỈ']}, ĐT: {row['ĐT 1']}, Fax: {row['FAX']}, Giới tính người đại diện: {row['GIỚI TÍNH']}, Họ tên người đại diện: {row['HỌ NGƯỜI ĐẠI DIỆN']} {row['TÊN NGƯỜI ĐẠI DIỆN']}, Chức vụ: {row['CVỤ']}, ĐTDĐ: {row['ĐTDĐ']}"
    jsonl_data.append({'prompt': prompt, 'completion': completion})

# ghi dữ liệu vào file jsonl
with open('output.jsonl', 'w', encoding='utf-8') as f:
    for data in jsonl_data:
        f.write(json.dumps(data, ensure_ascii=False) + '\n')
