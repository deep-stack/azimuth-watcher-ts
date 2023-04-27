//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintArrayTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress'], { unique: true })
export class GetConditionsState {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('varchar', { array: true })
    value0!: string[];

  @Column('numeric', { array: true, transformer: bigintArrayTransformer })
    value1!: bigint[];

  @Column('numeric', { array: true, transformer: bigintArrayTransformer })
    value2!: bigint[];

  @Column('numeric', { array: true, transformer: bigintArrayTransformer })
    value3!: bigint[];

  @Column('text', { nullable: true })
    proof!: string;
}
